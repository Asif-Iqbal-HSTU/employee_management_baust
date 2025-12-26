<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewLeaveRequest extends Notification implements ShouldQueue
{
    use Queueable;

    public $employeeName;
    public $leaveId;

    public function __construct($employeeName, $leaveId)
    {
        $this->employeeName = $employeeName;
        $this->leaveId = $leaveId;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast']; // store in DB + broadcast in real-time
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => "{$this->employeeName} submitted a new leave request.",
            'leave_id' => $this->leaveId,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'message' => "{$this->employeeName} submitted a new leave request.",
            'leave_id' => $this->leaveId,
        ]);
    }
}
