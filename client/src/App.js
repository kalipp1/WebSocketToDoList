import io from 'socket.io-client';
import { useState } from 'react';
import { useEffect } from 'react';
const { v4: uuidv4 } = require('uuid');

const App = () => {

  const [socket, setSocket] = useState();
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  useEffect(() => {
    const socket = io('ws://localhost:8000', { transports: ['websocket'] });
    setSocket(socket);

    socket.on('updateData', (tasks) => {
      setTasks(tasks);
    });

    socket.on('addTask', (task) => {
      setTasks((prevTasks) => [...prevTasks, task]);
    });

    socket.on('removeTask', (taskId) => {
      setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const submitForm = (event) => {
    event.preventDefault();
    if (!taskName.trim()) return;

    const newTask = { id: uuidv4(), name: taskName };
    setTaskName('');

    if (socket) {
        socket.emit('addTask', newTask);
    }
};

  const removeTask = (taskId, notifyServer = true) => {
    setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));

    if (socket && notifyServer) {
      socket.emit('removeTask', taskId);
    }
  };
  return (
    <div className="App">
  
      <header>
        <h1>ToDoList.app</h1>
      </header>
  
      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>
  
        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map((task) => (
            <li key={task.id} className='task'>{task.name} <button className="btn btn--red" onClick={() => removeTask(task.id)}>Remove</button></li>
          ))}
        </ul>
  
        <form onSubmit={submitForm} id="add-task-form">
          <input className="text-input" autoComplete="off" type="text" placeholder="Type your description" id="task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
          <button className="btn" type="submit">Add</button>
        </form>
  
      </section>
    </div>
  );
}

export default App;