import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getTasks, createTask, updateTask, deleteTask } from './api';
import './TaskManager.css';

const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3
};

const TaskManager = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isCustomOrder, setIsCustomOrder] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const sortedTasks = useMemo(() => {
    if (isCustomOrder) {
      return tasks;
    }
    return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [tasks, isCustomOrder]);

  const addTask = async () => {
    if (newTask.trim() !== '') {
      const newTaskItem = { text: newTask, category, priority, completed: false };
      try {
        await createTask(newTaskItem);
        fetchTasks();
        setNewTask('');
        setCategory('');
        setPriority('medium');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await updateTask(id, { completed: !completed });
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const newTasks = Array.from(sortedTasks);
    const [reorderedItem] = newTasks.splice(result.source.index, 1);
    newTasks.splice(result.destination.index, 0, reorderedItem);

    setTasks(newTasks);
    setIsCustomOrder(true);

    // You might want to implement a way to save the new order to the server
    // This could be a separate API endpoint or updating each task with a new order field
  };

  return (
    <div className="task-manager">
      <h1>Task Manager</h1>
      <div className="add-task">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new task"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTask}>Add Task</button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        {tasks.length > 0 ? (
          <Droppable droppableId="tasks">
            {(provided) => (
              <ul className="task-list" {...provided.droppableProps} ref={provided.innerRef}>
                {sortedTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`task-item ${task.completed ? 'completed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(task.id, task.completed)}
                        />
                        <span className="task-text">{task.text}</span>
                        <span className="category">{task.category}</span>
                        <span className={`priority ${task.priority}`}>{task.priority}</span>
                        <button onClick={() => removeTask(task.id)}>Delete</button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        ) : (
          <p>No tasks yet. Add a task to get started!</p>
        )}
      </DragDropContext>
    </div>
  );
};

export default TaskManager;
