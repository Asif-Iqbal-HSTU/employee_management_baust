<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; }
        .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { font-size: 11px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #000; padding: 6px; font-size: 10px; }
        th { background: #f0f0f0; }
        h3 { margin-top: 20px; margin-bottom: 8px; font-size: 14px; }
        footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
    </style>
</head>

<body>

<div class="title">Late & Absent Employees Summary Report — {{ $date }}</div>
<div class="subtitle">(Employees entering after 08:00 AM are considered late.)</div>

{{-- SUMMARY TABLE --}}
<h3>Department Summary</h3>
<table>
    <thead>
    <tr>
        <th>Department</th>
        <th>Total Employees</th>
        <th>Late</th>
        <th>Not Present</th>
    </tr>
    </thead>
    <tbody>
    @foreach ($summaryTable as $row)
        <tr>
            <td>{{ $row['department'] }}</td>
            <td style="text-align:center">{{ $row['total'] }}</td>
            <td style="text-align:center">{{ $row['late'] }}</td>
            <td style="text-align:center">{{ $row['absent'] }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

{{-- LATE DETAILS --}}
@foreach ($lateDetails as $dept => $employees)
    <h3>Late — {{ $dept }}</h3>
    <table>
        <thead>
        <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Entry Time</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($employees as $emp)
            <tr>
                <td>{{ $emp['employee_id'] }}</td>
                <td>{{ $emp['name'] }}</td>
                <td>{{ $emp['designation'] }}</td>
                <td>{{ $emp['in_time'] }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endforeach

{{-- ABSENT DETAILS --}}
@foreach ($absentDetails as $dept => $employees)
    <h3>Not Present — {{ $dept }}</h3>
    <table>
        <thead>
        <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Designation</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($employees as $emp)
            <tr>
                <td>{{ $emp['employee_id'] }}</td>
                <td>{{ $emp['name'] }}</td>
                <td>{{ $emp['designation'] }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endforeach

<footer>
    <b>Powered By: <b>ICT Wing & Archive, BAUST
    <br>
    <b>Contact: </b>Md. Asif iqbal, Asst. Software Engr., Phone: 01725215111
</footer>

</body>
</html>
