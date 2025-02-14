const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '/client')));

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});


const io = socket(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

const tasks = [];

io.on('connection', (socket) => {
    console.log(`New client connected! ID: ${socket.id}`);

    socket.emit('updateData', tasks);

    socket.on('addTask', (task) => {
        tasks.push(task);
        console.log(`Task added: ${task.name} (ID: ${task.id})`);

        io.emit('updateData', tasks);
    });

    socket.on('removeTask', (taskId) => {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const removedTask = tasks.splice(taskIndex, 1);
            console.log(`Task removed: ${removedTask[0].name} (ID: ${taskId})`);

            io.emit('updateData', tasks);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
}); 