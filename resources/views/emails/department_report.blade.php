<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: "Times New Roman", serif;
            font-size: 12px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            font-size: 11px;
        }
        th, td {
            border: 1px solid #444;
            padding: 6px;
            text-align: left;
        }
        .notice {
            background-color: #f4f4f4;
            border: 1px solid #999;
            padding: 8px;
            margin-bottom: 15px;
            font-size: 12px;
            text-align: center;
            font-weight: bold;
        }
        footer {
            margin-top: 30px;
            font-size: 10px;
            text-align: center;
            color: #888;
        }
    </style>
</head>
<body>

<div class="notice">
    The Employee Attendance System is now fully operational. Please register your fingerprint or facial data on any of the designated devices. <br>
    Department heads will receive this report daily at 10:00 AM. The report contains today’s entry times, as well as yesterday’s entry and exit times for all employees in your department. <br>
    - ICT Wing & Archive
</div>


<h2>Attendance Report</h2>
<p>Department: <strong>{{ $departmentName }}</strong></p>
<p>Date Range: <strong>{{ $dateRange }}</strong></p>

<table>
    <thead>
    <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Designation</th>
        <th>Date</th>
        <th>In Time</th>
        <th>Out Time</th>
    </tr>
    </thead>
    <tbody>
    @php
        $lastEmployeeId = null;
    @endphp
    @foreach ($logs as $log)
        <tr>
            <td>{{ $log->employee_id !== $lastEmployeeId ? $log->employee_id : '' }}</td>
            <td>{{ $log->employee_id !== $lastEmployeeId ? $log->name : '' }}</td>
            <td>{{ $log->employee_id !== $lastEmployeeId ? $log->designation : '' }}</td>
            <td>{{ $log->date }}</td>
            <td>{{ $log->in_time }}</td>
            <td>{{ $log->out_time }}</td>
        </tr>
        @php
            $lastEmployeeId = $log->employee_id;
        @endphp
    @endforeach
    </tbody>
</table>

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
