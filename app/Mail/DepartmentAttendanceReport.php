<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class DepartmentAttendanceReport extends Mailable
{
    use Queueable, SerializesModels;

    public $logs;
    public $dateRange;
    public $departmentName;

    public function __construct($departmentName, $logs, $dateRange)
    {
        $this->departmentName = $departmentName;
        $this->logs = $logs;
        $this->dateRange = $dateRange;
    }

    public function build()
    {
        $pdf = Pdf::loadView('emails.department_report', [
            'departmentName' => $this->departmentName,
            'logs' => $this->logs,
            'dateRange' => $this->dateRange,
        ]);

        return $this->subject("Attendance Report for {$this->departmentName}")
            ->view('emails.department_report') // optional HTML body
            ->attachData($pdf->output(), 'Attendance_Report.pdf');
    }
}
