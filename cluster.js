const cluster = require('cluster');
const os = require('os');
const pid = process.pid;

if (cluster.isMaster) {
  const cpusCount = os.cpus().length;
  console.log(`CPUs: ${cpusCount}`);
  console.log(`Master started. PID: ${pid}`);
  for (let i = 0; i < cpusCount - 1; i++) {
    const worker = cluster.fork();
    worker.on('exit', () => {
      console.log(`Worker died! PID: ${worker.process.pid}`);
      cluster.fork();
    });
    worker.send('Hello from server!');
    worker.on('message', message =>
      console.log(`Message from worker ${worker.process.pid}: ${JSON.stringify(message)}`),
    );
  }
}

if (cluster.isWorker) {
  require('./worker.js');
  process.on('message', message => console.log(`Message from master: ${message}`));
  process.send({ text: 'Hello', pid });
}
