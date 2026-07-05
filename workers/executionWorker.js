const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const Docker = require('dockerode');
const path = require('path');
const fs = require('fs');
const os = require('os');
const dotenv = require('dotenv');

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const publisher = new IORedis(REDIS_URL);
const docker = new Docker();

// Language configurations
const LANGUAGE_CONFIG = {
  python: {
    image: 'python:3.12-alpine',
    extension: '.py',
    getCmd: (filename) => ['python', filename],
    getCompileCmd: () => null,
  },
  cpp: {
    image: 'gcc:13-bookworm',
    extension: '.cpp',
    getCmd: () => ['./a.out'],
    getCompileCmd: (filename) => ['g++', '-o', 'a.out', filename],
  },
  java: {
    image: 'eclipse-temurin:21-jdk-alpine',
    extension: '.java',
    getCmd: () => ['java', 'Main'],
    getCompileCmd: (filename) => ['javac', filename],
    // Java requires filename to match class name
    fixedFilename: 'Main.java',
  },
};

// Resource limits
const MEMORY_LIMIT = 256 * 1024 * 1024; // 256MB
const CPU_NANO = 1e9;                    // 1 CPU core
const TIMEOUT_MS = 15000;               // 15 seconds

/**
 * Execute code inside a Docker container
 */
async function executeCode(language, code, stdin = '') {
  const config = LANGUAGE_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  // Create temp directory for code
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codesync-'));
  const filename = config.fixedFilename || `code${config.extension}`;
  const filePath = path.join(tmpDir, filename);
  fs.writeFileSync(filePath, code);

  const startTime = Date.now();

  try {
    // If language needs compilation, compile first
    if (config.getCompileCmd(filename)) {
      const compileResult = await runContainer(config.image, config.getCompileCmd(filename), tmpDir, '');
      if (compileResult.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compileResult.stderr || 'Compilation failed',
          exitCode: compileResult.exitCode,
          executionTimeMs: Date.now() - startTime,
        };
      }
    }

    // Run the code
    const result = await runContainer(config.image, config.getCmd(filename), tmpDir, stdin);

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTimeMs: Date.now() - startTime,
    };
  } finally {
    // Clean up temp files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Failed to clean temp dir:', e.message);
    }
  }
}

/**
 * Run a command in a Docker container
 */
async function runContainer(image, cmd, codeDir, stdin = '') {
  // Ensure image exists locally
  try {
    await docker.getImage(image).inspect();
  } catch {
    console.log(`📥 Pulling image: ${image}...`);
    await new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  const container = await docker.createContainer({
    Image: image,
    Cmd: cmd,
    WorkingDir: '/code',
    HostConfig: {
      Memory: MEMORY_LIMIT,
      NanoCpus: CPU_NANO,
      NetworkMode: 'none',
      Binds: [`${codeDir}:/code`],
      AutoRemove: false,
      ReadonlyRootfs: false,
    },
    AttachStdin: !!stdin,
    AttachStdout: true,
    AttachStderr: true,
    OpenStdin: !!stdin,
    StdinOnce: true,
    Tty: false,
  });

  try {
    // Attach to get output streams
    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
      stdin: !!stdin,
    });

    let stdout = '';
    let stderr = '';

    // Collect output
    const stdoutStream = { write: (chunk) => { stdout += chunk.toString(); } };
    const stderrStream = { write: (chunk) => { stderr += chunk.toString(); } };
    container.modem.demuxStream(stream, stdoutStream, stderrStream);

    // Send stdin if provided
    if (stdin) {
      stream.write(stdin);
      stream.end();
    }

    await container.start();

    // Wait with timeout
    const result = await Promise.race([
      container.wait(),
      new Promise((_, reject) =>
        setTimeout(async () => {
          try { await container.stop({ t: 1 }); } catch {}
          reject(new Error('TIMEOUT'));
        }, TIMEOUT_MS)
      ),
    ]);

    // Wait a moment for stream buffers to flush
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: result.StatusCode || 0,
    };
  } catch (error) {
    if (error.message === 'TIMEOUT') {
      return {
        stdout: '',
        stderr: 'Execution timed out (15 second limit)',
        exitCode: 124,
      };
    }
    throw error;
  } finally {
    try { await container.remove({ force: true }); } catch {}
  }
}

// ============================================
// BullMQ Worker
// ============================================
const worker = new Worker(
  'code-execution',
  async (job) => {
    const { executionId, roomId, username, language, code, stdin, testCases } = job.data;
    console.log(`⚙️  Processing job ${job.id}: ${language} code for ${username}`);

    // Publish "running" status
    publisher.publish('execution:result', JSON.stringify({
      executionId,
      roomId,
      username,
      status: 'running',
    }));

    try {
      if (testCases && testCases.length > 0) {
        // Run code against each test case
        const testResults = [];
        let allPassed = true;

        for (const tc of testCases) {
          const result = await executeCode(language, code, tc.input || '');
          const actualOutput = result.stdout.trim();
          const expectedOutput = (tc.expectedOutput || '').trim();
          const passed = actualOutput === expectedOutput;

          if (!passed) allPassed = false;

          testResults.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput,
            passed,
          });
        }

        // Publish test results
        publisher.publish('execution:result', JSON.stringify({
          executionId,
          roomId,
          username,
          status: allPassed ? 'completed' : 'completed',
          stdout: '',
          stderr: '',
          exitCode: allPassed ? 0 : 1,
          executionTimeMs: 0,
          testResults,
        }));
      } else {
        // Simple execution
        const result = await executeCode(language, code, stdin);

        publisher.publish('execution:result', JSON.stringify({
          executionId,
          roomId,
          username,
          status: result.exitCode === 0 ? 'completed' : 'error',
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          executionTimeMs: result.executionTimeMs,
        }));
      }
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error.message);

      publisher.publish('execution:result', JSON.stringify({
        executionId,
        roomId,
        username,
        status: 'error',
        stdout: '',
        stderr: error.message,
        exitCode: 1,
        executionTimeMs: 0,
      }));
    }
  },
  {
    connection,
    concurrency: 3, // Process up to 3 jobs at a time
  }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log('⚙️  Execution worker started, waiting for jobs...');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
