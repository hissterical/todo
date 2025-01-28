// utils/TaskUtils.ts
import { Task } from '../types/TaskTypes';

const addTask = (taskText: string, tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
  if (taskText.trim().length > 0) {
    const newTask: Task = { id: Date.now().toString(), text: taskText, completed: false };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }
};

export default addTask;