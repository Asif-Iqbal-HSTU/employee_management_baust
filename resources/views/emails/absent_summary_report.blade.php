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
    Absent Employees Summary Report for {{ $date }}<br>
    - ICT Wing & Archive
</div>

<h2>Department Summary</h2>
<table>
    <thead>
    <tr>
        <th>Department</th>
        <th>Total Employees</th>
        <th>Absent Employees</th>
    </tr>
    </thead>
    <tbody>
    @foreach($summaryTable as $row)
        <tr>
            <td>{{ $row['department'] }}</td>
            <td>{{ $row['total'] }}</td>
            <td>{{ $row['late'] }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

@foreach($lateDetails as $deptName => $employees)
    <h3>{{ $deptName }}</h3>
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

<footer>
    Powered By: ICT Wing & Archive, BAUST
</footer>

</body>
</html>
