<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AllUsersExport implements FromCollection, WithHeadings
{
    protected $users;

    public function __construct(array $users)
    {
        $this->users = $users;
    }

    public function collection()
    {
        return collect($this->users)->map(function ($user) {
            return [
                'employee_id' => $user['employee_id'],
                'name' => $user['name'],
                'role' => $user['role'],
                'card_info' => $user['card_info'],
            ];
        });
    }

    public function headings(): array
    {
        return ['Employee ID', 'Name', 'Role', 'Card Info'];
    }
}

