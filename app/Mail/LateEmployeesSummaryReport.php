<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class LateEmployeesSummaryReport extends Mailable
{
    use Queueable, SerializesModels;

    public $summaryTable;
    public $lateDetails;
    public $absentDetails;
    public $date;

    public function __construct($summaryTable, $lateDetails, $absentDetails, $date)
    {
        $this->summaryTable = $summaryTable;
        $this->lateDetails = $lateDetails;
        $this->absentDetails = $absentDetails;
        $this->date = $date;
    }

    public function build()
    {
        $pdf = Pdf::loadView('emails.late_summary_report', [
            'summaryTable' => $this->summaryTable,
            'lateDetails' => $this->lateDetails,
            'absentDetails' => $this->absentDetails,
            'date' => $this->date,
        ]);

        return $this->subject("Late Employees Summary Report - {$this->date}")
            ->view('emails.late_summary_report')
            ->attachData($pdf->output(), 'Late_Employees_Report.pdf');
    }
}
