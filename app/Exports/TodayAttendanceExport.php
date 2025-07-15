<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TodayAttendanceExport implements FromCollection, WithHeadings
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = collect($data);
    }

    public function collection()
    {
        return $this->data->map(function ($row) {
            return [
                $row['employee_id'],
                $row['name'],
                $row['entry_time'] ?? 'N/A',
            ];
        });
    }

    public function headings(): array
    {
        return ['Employee ID', 'Name', 'Entry Time'];
    }
}

