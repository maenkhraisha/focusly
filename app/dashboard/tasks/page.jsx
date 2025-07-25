"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Play,
    Pause,
    Trash2,
    Clock,
    CheckCircle,
    Trophy,
} from "lucide-react";

export default function Tasks() {
    const { state, dispatch } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "" });
    const [timers, setTimers] = useState({});
    const [completedTasksFilter, setCompletedTasksFilter] = useState("week"); // 'week', 'month', 'all'

    // Update timers every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers((prev) => {
                const updated = { ...prev };
                Object.keys(state.activeTimers).forEach((taskId) => {
                    if (state.activeTimers[taskId]) {
                        updated[taskId] = Math.floor(
                            (Date.now() - state.activeTimers[taskId]) / 1000
                        );
                    }
                });
                return updated;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [state.activeTimers]);

    const handleAddTask = () => {
        if (newTask.title.trim()) {
            dispatch({
                type: "ADD_TASK",
                payload: {
                    title: newTask.title,
                    description: newTask.description,
                    memo: "",
                    totalTime: 0,
                    createdAt: new Date().toISOString(),
                },
            });
            setNewTask({ title: "", description: "" });
            setIsDialogOpen(false);
        }
    };

    const handleStartTimer = (taskId) => {
        dispatch({ type: "START_TIMER", payload: taskId });
    };

    const handleStopTimer = (taskId) => {
        dispatch({ type: "STOP_TIMER", payload: taskId });
    };

    const handleUpdateMemo = (taskId, memo) => {
        dispatch({
            type: "UPDATE_TASK",
            payload: { id: taskId, updates: { memo } },
        });
    };

    const handleDeleteTask = (taskId) => {
        dispatch({ type: "DELETE_TASK", payload: taskId });
    };

    const handleFinishTask = (taskId) => {
        dispatch({ type: "FINISH_TASK", payload: taskId });
    };

    const handleDeleteFinishedTask = (taskId) => {
        dispatch({ type: "DELETE_FINISHED_TASK", payload: taskId });
    };

    const getFilteredFinishedTasks = () => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return state.finishedTasks.filter((task) => {
            const finishedDate = new Date(task.finishedAt);

            switch (completedTasksFilter) {
                case "week":
                    return finishedDate >= oneWeekAgo;
                case "month":
                    return finishedDate >= oneMonthAgo;
                case "all":
                default:
                    return true;
            }
        });
    };

    const filteredFinishedTasks = getFilteredFinishedTasks();

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900'>Tasks</h2>
                    <p className='text-gray-600'>
                        Manage your tasks and track time spent on each one
                        {state.finishedTasks.length > 0 && (
                            <span className='ml-2 text-green-600 font-medium'>
                                • {state.finishedTasks.length} completed
                            </span>
                        )}
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className='mr-2 h-4 w-4' />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                            <DialogDescription>
                                Create a new task to track your productivity and
                                time.
                            </DialogDescription>
                        </DialogHeader>
                        <div className='grid gap-4 py-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor='title'>Task Title</Label>
                                <Input
                                    id='title'
                                    value={newTask.title}
                                    onChange={(e) =>
                                        setNewTask({
                                            ...newTask,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder='Enter task title...'
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='description'>
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id='description'
                                    value={newTask.description}
                                    onChange={(e) =>
                                        setNewTask({
                                            ...newTask,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder='Add task description...'
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant='outline'
                                onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddTask}>Add Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {state.tasks.length === 0 ? (
                <Card>
                    <CardContent className='flex flex-col items-center justify-center py-12'>
                        <Clock className='h-12 w-12 text-gray-400 mb-4' />
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                            No tasks yet
                        </h3>
                        <p className='text-gray-600 text-center mb-6'>
                            Create your first task to start tracking your
                            productivity and managing your time effectively.
                        </p>
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add Your First Task
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </CardContent>
                </Card>
            ) : (
                <div className='grid gap-4'>
                    {state.tasks.map((task) => {
                        const isTimerActive = !!state.activeTimers[task.id];
                        const currentTime = timers[task.id] || 0;
                        const totalDisplayTime = task.totalTime + currentTime;

                        return (
                            <Card
                                key={task.id}
                                className='hover:shadow-md transition-shadow'>
                                <CardHeader>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <CardTitle className='text-lg'>
                                                {task.title}
                                            </CardTitle>
                                            {task.description && (
                                                <CardDescription className='mt-1'>
                                                    {task.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                                handleDeleteTask(task.id)
                                            }
                                            className='text-red-600 hover:text-red-700 hover:bg-red-50'>
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    {/* Timer Section */}
                                    <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                                        <div className='flex items-center space-x-4'>
                                            <div className='text-2xl font-mono font-bold text-gray-900'>
                                                {formatTime(totalDisplayTime)}
                                            </div>
                                            {isTimerActive && (
                                                <div className='flex items-center text-green-600'>
                                                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2' />
                                                    <span className='text-sm font-medium'>
                                                        Running
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex space-x-2'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleFinishTask(task.id)
                                                }
                                                className='text-green-600 hover:text-green-700 hover:bg-green-50'>
                                                <CheckCircle className='mr-2 h-4 w-4' />
                                                Finish
                                            </Button>
                                            {isTimerActive ? (
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() =>
                                                        handleStopTimer(task.id)
                                                    }>
                                                    <Pause className='mr-2 h-4 w-4' />
                                                    Stop
                                                </Button>
                                            ) : (
                                                <Button
                                                    size='sm'
                                                    onClick={() =>
                                                        handleStartTimer(
                                                            task.id
                                                        )
                                                    }>
                                                    <Play className='mr-2 h-4 w-4' />
                                                    Start
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Memo Section */}
                                    <div className='space-y-2'>
                                        <Label htmlFor={`memo-${task.id}`}>
                                            Task Notes
                                        </Label>
                                        <Textarea
                                            id={`memo-${task.id}`}
                                            value={task.memo || ""}
                                            onChange={(e) =>
                                                handleUpdateMemo(
                                                    task.id,
                                                    e.target.value
                                                )
                                            }
                                            placeholder='Add notes, observations, or details about this task...'
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Finished Tasks Section */}
            {state.finishedTasks.length > 0 && (
                <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                            <Trophy className='h-5 w-5 text-green-600' />
                            <h3 className='text-lg font-semibold text-gray-900'>
                                Completed Tasks
                            </h3>
                            <span className='text-sm text-gray-500'>
                                ({filteredFinishedTasks.length} of{" "}
                                {state.finishedTasks.length})
                            </span>
                        </div>
                        <div className='flex space-x-2'>
                            <Button
                                variant={
                                    completedTasksFilter === "week"
                                        ? "default"
                                        : "outline"
                                }
                                size='sm'
                                onClick={() => setCompletedTasksFilter("week")}>
                                Last Week
                            </Button>
                            <Button
                                variant={
                                    completedTasksFilter === "month"
                                        ? "default"
                                        : "outline"
                                }
                                size='sm'
                                onClick={() =>
                                    setCompletedTasksFilter("month")
                                }>
                                Last Month
                            </Button>
                            <Button
                                variant={
                                    completedTasksFilter === "all"
                                        ? "default"
                                        : "outline"
                                }
                                size='sm'
                                onClick={() => setCompletedTasksFilter("all")}>
                                All Tasks
                            </Button>
                        </div>
                    </div>

                    {filteredFinishedTasks.length === 0 ? (
                        <Card className='border-dashed border-2 border-gray-300'>
                            <CardContent className='flex flex-col items-center justify-center py-8'>
                                <Trophy className='h-8 w-8 text-gray-400 mb-4' />
                                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                    No completed tasks in this period
                                </h3>
                                <p className='text-gray-600 text-center text-sm'>
                                    {completedTasksFilter === "week" &&
                                        "No tasks completed in the last week."}
                                    {completedTasksFilter === "month" &&
                                        "No tasks completed in the last month."}
                                    {completedTasksFilter === "all" &&
                                        "No tasks have been completed yet."}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className='grid gap-4'>
                            {filteredFinishedTasks.map((task) => (
                                <Card
                                    key={task.id}
                                    className='bg-green-50 border-green-200'>
                                    <CardHeader>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex-1'>
                                                <div className='flex items-center space-x-2'>
                                                    <CheckCircle className='h-5 w-5 text-green-600' />
                                                    <CardTitle className='text-lg text-green-800'>
                                                        {task.title}
                                                    </CardTitle>
                                                </div>
                                                {task.description && (
                                                    <CardDescription className='mt-1 text-green-700'>
                                                        {task.description}
                                                    </CardDescription>
                                                )}
                                                <div className='mt-2 text-sm text-green-600'>
                                                    Completed on{" "}
                                                    {new Date(
                                                        task.finishedAt
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                    handleDeleteFinishedTask(
                                                        task.id
                                                    )
                                                }
                                                className='text-red-600 hover:text-red-700 hover:bg-red-50'>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        {/* Total Time Display */}
                                        <div className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                                            <div className='flex items-center space-x-2'>
                                                <Clock className='h-4 w-4 text-gray-500' />
                                                <span className='text-sm font-medium text-gray-700'>
                                                    Total Time:
                                                </span>
                                            </div>
                                            <div className='text-lg font-mono font-bold text-green-700'>
                                                {formatTime(
                                                    task.totalTime || 0
                                                )}
                                            </div>
                                        </div>

                                        {/* Task Notes */}
                                        {task.memo && (
                                            <div className='space-y-2'>
                                                <Label className='text-green-800'>
                                                    Task Notes
                                                </Label>
                                                <div className='p-3 bg-white rounded-lg border text-sm text-gray-700 whitespace-pre-wrap'>
                                                    {task.memo}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
