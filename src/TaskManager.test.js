import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskManager from './TaskManager';
import { getTasks, createTask, updateTask, deleteTask } from './api';
jest.spyOn(console, 'error').mockImplementation((message) => {
  if (!message.includes('defaultProps will be removed')) {
    console.error(message);
  }
});

jest.mock('./api', () => ({
  getTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

describe('TaskManager Component', () => {
  const mockTasks = [
    { id: 1, text: 'Task 1', category: 'Work', priority: 'high', completed: false },
    { id: 2, text: 'Task 2', category: 'Personal', priority: 'medium', completed: true },
  ];

  beforeEach(() => {
    getTasks.mockResolvedValue({ data: mockTasks });
  });

  test('renders tasks from API', async () => {
    render(<TaskManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    createTask.mockResolvedValue({});

    render(<TaskManager />);

    fireEvent.change(screen.getByPlaceholderText(/Enter a new task/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByPlaceholderText(/Category/i), { target: { value: 'Work' } });
    fireEvent.click(screen.getByText(/Add Task/i));

    await waitFor(() => expect(createTask).toHaveBeenCalledWith({
      text: 'New Task',
      category: 'Work',
      priority: 'medium',
      completed: false,
    }));
  });

  test('marks a task as complete', async () => {
    updateTask.mockResolvedValue({});
    render(<TaskManager />);
  
    await waitFor(() => expect(screen.getByText('Task 1')).toBeInTheDocument());
  
    const taskItem = screen.getByText('Task 1').closest('li');
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
  
    fireEvent.click(checkbox);
  
    await waitFor(() => expect(updateTask).toHaveBeenCalledWith(1, { completed: true }));
  });
  
  test('deletes a task', async () => {
    deleteTask.mockResolvedValue({});
    render(<TaskManager />);

    await waitFor(() => expect(screen.getByText('Task 1')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText(/Delete/i)[0]);

    await waitFor(() => expect(deleteTask).toHaveBeenCalledWith(1));
  });
});
