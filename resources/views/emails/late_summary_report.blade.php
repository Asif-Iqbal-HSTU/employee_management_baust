<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: "Times New Roman", serif; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; font-size: 11px; margin-bottom: 20px; }
        th, td { border: 1px solid #444; padding: 6px; text-align: left; }
        .notice {
            background-color: #f4f4f4; border: 1px solid #999; padding: 8px;
            margin-bottom: 15px; font-size: 12px; text-align: center; font-weight: bold;
        }
        footer { margin-top: 30px; font-size: 10px; text-align: center; color: #888; }
        h2 { margin-bottom: 5px; }
    </style>
</head>
<body>

<div class="notice">
    Late and Absent Employees Summary Report for {{ $date }}<br>
    (Employees entering after 08:00 AM are considered late.)<br>
    - ICT Wing & Archive
</div>

<h2>Department Summary</h2>
<table>
    <thead>
    <tr>
        <th>Department</th>
        <th>Total Employees</th>
        <th>Late Employees</th>
        <th>Not Present Employees</th>
    </tr>
    </thead>
    <tbody>
    @foreach($summaryTable as $row)
        <tr>
            <td>{{ $row['department'] }}</td>
            <td>{{ $row['total'] }}</td>
            <td>{{ $row['late'] }}</td>
            <td>{{ $row['absent'] }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

{{-- Late Employees Details --}}
@foreach($lateDetails as $deptName => $employees)
    <h3>Late - {{ $deptName }}</h3>
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
        @foreach($employees as $emp)
            <tr>
                <td>{{ $emp->employee_id }}</td>
                <td>{{ $emp->name }}</td>
                <td>{{ $emp->designation }}</td>
                <td>{{ $emp->in_time }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endforeach

{{-- Absent Employees Details --}}
@foreach($absentDetails as $deptName => $employees)
    <h3>Not Present - {{ $deptName }}</h3>
    <table>
        <thead>
        <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Designation</th>
        </tr>
        </thead>
        <tbody>
        @foreach($employees as $emp)
            <tr>
                <td>{{ $emp->employee_id }}</td>
                <td>{{ $emp->name }}</td>
                <td>{{ $emp->designation }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endforeach

<div class="notice">
    <i>Some employees can be assigned to late hours. They are also considered late/not-present as there are no data of current date in the device till the time of automatic report generation. </i>
</div>
<div class="notice">
    <i>The following persons have duplicate ID issues. And may have false data which we are fixing: <br>Md. Mahadi Hasan (CSE), Md. Yah-Ya Ul Haque (EEE), Sifat Hossain (EEE), Md. Mahmudul Hasan (ME), Md. Shahadat Hossain (DBA), Azra Sultana Sadia (EEE) and Md. Mominul Hoque (Registrar Office) </i>
</div>

<footer>
    Powered By: ICT Wing & Archive, BAUST
</footer>

</body>
</html>
