<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/zk/logs', [App\Http\Controllers\ZKTecoController::class, 'getLogs']);
Route::get('/zk/users', [App\Http\Controllers\ZKTecoController::class, 'getUsers']);
Route::get('/allEmployeeAttendance', [App\Http\Controllers\AttendanceController::class, 'employeeList'])->name('employeeList');;
Route::get('/employee-attendance/{employeeId}', [App\Http\Controllers\AttendanceController::class, 'getUserAttendance']);
//Route::get('/employee-attendance/{employeeId}', [App\Http\Controllers\AttendanceController::class, 'getUserAttendance']);
Route::get('/today-entry', [App\Http\Controllers\AttendanceController::class, 'todayEntryList'])->name('attendance.today');

Route::get('/socket-check', function () {
    return function_exists('socket_create') ? 'Sockets Enabled' : 'Sockets Not Enabled';
});

use App\Http\Controllers\AttendanceController;

Route::get('/device-attendance', [AttendanceController::class, 'deviceLogs'])->name('attendance.device');


//Route::get('/attendance/report', [AttendanceController::class, 'viewReport'])->name('attendance.report');
Route::post('/attendance/sync', [AttendanceController::class, 'syncDeviceLogs'])->name('attendance.sync');


Route::post('/users/sync', [AttendanceController::class, 'syncUsersFromDevices'])->name('users.sync');

Route::post('/logs/sync', [\App\Http\Controllers\DeviceLogController::class, 'syncRawLogs'])->name('logs.sync');
Route::get('/attendance/report', [\App\Http\Controllers\DeviceLogController::class, 'generateReport'])->name('attendance.report');

use App\Http\Controllers\UserAssignmentController;

Route::get('/user-assignments', [UserAssignmentController::class, 'index'])->name('user-assignments.index');
Route::post('/user-assignments', [UserAssignmentController::class, 'store'])->name('user-assignments.store');



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
