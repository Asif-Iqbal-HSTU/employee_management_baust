<?php

namespace App\Console\Commands;

use App\Helpers\BijoyToUnicode;
use App\Models\Department;
use App\Models\Designation;
use App\Models\EmployeeDetail;
use App\Models\User;
use App\Models\UserAssignment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportEmployeeDetails extends Command
{
    protected $signature = 'employees:import-details {file? : Path to the Excel file}';
    protected $description = 'Import employee details from the HR-provided Excel file into the employee_details table';

    public function handle()
    {
        $filePath = $this->argument('file') ?? public_path('File/All Employee List.xlsx');

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $this->info("Loading spreadsheet: {$filePath}");
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getActiveSheet();
        $highestRow = $sheet->getHighestRow();

        $currentDepartment = null;
        $imported = 0;
        $created = 0;
        $skipped = 0;

        for ($row = 1; $row <= $highestRow; $row++) {
            $bVal = trim($sheet->getCell('B' . $row)->getValue() ?? '');
            $cVal = trim($sheet->getCell('C' . $row)->getValue() ?? '');
            $dVal = trim($sheet->getCell('D' . $row)->getValue() ?? '');
            $jVal = trim($sheet->getCell('J' . $row)->getValue() ?? '');

            // Detect department header rows
            // Department rows have text in B but nothing in C,D and are not "SL No."
            if ($bVal && !$cVal && !$dVal && $bVal !== 'SL No.' && $row > 3) {
                $currentDepartment = $bVal;
                $this->line("  📂 Department: {$currentDepartment}");
                continue;
            }

            // Skip header rows and empty rows
            if (!$jVal || $bVal === 'SL No.') {
                continue;
            }

            // This is a data row - $jVal is the employee ID
            $employeeId = trim((string) $jVal);

            // Check if user exists in the system
            $userExists = User::where('employee_id', $employeeId)->exists();

            // If user doesn't exist, create them
            if (!$userExists) {
                $englishName = trim((string) $sheet->getCell('D' . $row)->getValue());
                $post = $this->clean($sheet->getCell('E' . $row)->getValue());

                // 1. Ensure Department exists
                $dept = null;
                if ($currentDepartment) {
                    $dept = $this->resolveDepartment($currentDepartment);
                }

                // 2. Ensure Designation exists
                $desig = null;
                if ($post) {
                    $desig = Designation::firstOrCreate(
                        ['designation_name' => $post]
                    );
                }

                // 3. Create User
                $user = User::create([
                    'employee_id' => $employeeId,
                    'name'        => $englishName ?: 'Employee ' . $employeeId,
                    'email'       => $employeeId . '@baust.local',
                    'password'    => Hash::make($employeeId),
                ]);

                // 4. Create Assignment
                if ($dept || $desig) {
                    UserAssignment::create([
                        'employee_id'    => $employeeId,
                        'department_id'  => $dept ? $dept->id : null,
                        'designation_id' => $desig ? $desig->id : null,
                    ]);
                }

                $created++;
            } else {
                $imported++;
            }

            // Parse parents names - first line is father, second is mother
            $rawParents = $sheet->getCell('N' . $row)->getValue();
            $parentNames = $this->splitParentNames($rawParents);

            // Extract all data
            $data = [
                'employee_id'          => $employeeId,
                'name_bangla'          => BijoyToUnicode::convert($this->clean($sheet->getCell('C' . $row)->getValue())),
                'post'                 => $this->clean($sheet->getCell('E' . $row)->getValue()),
                'employment_type'      => $this->clean($sheet->getCell('F' . $row)->getValue()),
                'gender'               => $this->clean($sheet->getCell('H' . $row)->getValue()),
                'joining_date'         => $this->formatJoiningDate($sheet->getCell('I' . $row)->getValue()),
                'date_of_birth'        => $this->formatDate($sheet->getCell('K' . $row)),
                'nid_no'               => $this->clean($sheet->getCell('L' . $row)->getValue()),
                'mobile_no'            => $this->fixMobile($sheet->getCell('M' . $row)->getValue()),
                'parents_name'         => $this->clean($rawParents),
                'father_name'          => $parentNames['father'],
                'mother_name'          => $parentNames['mother'],
                'address'              => $this->clean($sheet->getCell('O' . $row)->getValue()),
                'district'             => $this->clean($sheet->getCell('P' . $row)->getValue()),
                'employee_class'       => $this->clean($sheet->getCell('Q' . $row)->getValue()),
                'department_from_sheet' => $currentDepartment,
            ];

            EmployeeDetail::updateOrCreate(
                ['employee_id' => $employeeId],
                $data
            );

            $imported++;
        }

        $this->newLine();
        $this->info("✅ Import completed!");
        $this->table(
            ['Metric', 'Count'],
            [
                ['Updated (Existing)', $imported],
                ['Created (New)', $created],
            ]
        );

        return 0;
    }

    private function clean($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        return trim(preg_replace('/\s+/', ' ', (string) $value));
    }

    private function fixMobile($value): ?string
    {
        $cleaned = $this->clean($value);
        if ($cleaned === null) {
            return null;
        }
        // Bangladesh mobile numbers start with 01; Excel often drops the leading 0
        if (str_starts_with($cleaned, '1')) {
            $cleaned = '0' . $cleaned;
        }
        return $cleaned;
    }

    private function splitParentNames($value): array
    {
        $result = ['father' => null, 'mother' => null];

        if ($value === null || $value === '') {
            return $result;
        }

        // Split by newline (Excel cells may use \n or \r\n)
        $lines = preg_split('/[\r\n]+/', (string) $value);
        $lines = array_values(array_filter(array_map('trim', $lines), fn($l) => $l !== ''));

        if (count($lines) === 1) {
            // Only father's name
            $result['father'] = $lines[0];
        } elseif (count($lines) === 2) {
            // Clean split: first = father, second = mother
            $result['father'] = $lines[0];
            $result['mother'] = $lines[1];
        } else {
            // 3+ lines: father's name has wrapped in Excel
            // Last line is mother's name, everything before is father's name
            $result['mother'] = array_pop($lines);
            $result['father'] = implode(' ', $lines);
        }

        return $result;
    }

    private function formatDate($cell): ?string
    {
        $value = $cell->getValue();
        if ($value === null || $value === '') {
            return null;
        }

        // If it's a numeric Excel date serial
        if (is_numeric($value)) {
            try {
                $dateTime = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $value);
                return $dateTime->format('d/m/Y');
            } catch (\Exception $e) {
                return (string) $value;
            }
        }

        return trim((string) $value);
    }

    private function formatJoiningDate($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        // If it's a pure numeric Excel date serial (single date, no annotations)
        if (is_numeric($value)) {
            try {
                $dateTime = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $value);
                return $dateTime->format('d/m/Y');
            } catch (\Exception $e) {
                return (string) $value;
            }
        }

        // Multi-line text with dates and annotations (e.g. "01/02/2015 (Lecturer)")
        // Process each line - convert any numeric-only lines from Excel serial
        $lines = preg_split('/[\r\n]+/', (string) $value);
        $processed = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') continue;
            if (is_numeric($line)) {
                try {
                    $dateTime = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $line);
                    $processed[] = $dateTime->format('d/m/Y');
                } catch (\Exception $e) {
                    $processed[] = $line;
                }
            } else {
                $processed[] = $line;
            }
        }
        return implode("\n", $processed);
    }

    private function resolveDepartment(string $name): Department
    {
        $name = trim($name);
        
        // 1. Direct match by name or short_name
        $dept = Department::where('dept_name', $name)
            ->orWhere('short_name', $name)
            ->first();
            
        if ($dept) return $dept;
        
        // 2. Map common Excel variations
        $map = [
            'Department of CSE' => 'CSE',
            'Department of ICT' => 'ICT',
            'Department of EEE' => 'EEE',
            'Department of ME' => 'ME',
            'Department of IPE' => 'IPE',
            'Department of CE' => 'CE',
            'Department of DBA' => 'DBA',
            'Department of AIS' => 'AIS',
            'Department of English' => 'English',
            'Department of A&S' => 'A&S',
            'Office of the Library' => 'Central Library',
            'BAUST Security Section' => 'BAUST Security Section',
        ];
        
        if (isset($map[$name])) {
            $short = $map[$name];
            $dept = Department::where('short_name', $short)->first();
            if ($dept) return $dept;
        }

        // 3. Fallback to existing or create new
        return Department::firstOrCreate(
            ['dept_name' => $name],
            ['short_name' => $name]
        );
    }
}
