<!DOCTYPE html>
<html>
<head>
    <title>Repair Request - {{ $request->job_id }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; margin: 0; padding: 5px; line-height: 1.25; }
        .header { text-align: center; margin-bottom: 10px; }
        .header h2 { margin: 0; font-size: 15px; }
        .header h3 { margin: 2px 0; font-size: 13px; }
        .header h4 { margin: 2px 0; font-size: 12px; }
        .section { margin-bottom: 8px; border: 1px solid #000; padding: 6px; }
        .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; font-size: 12px; }
        .indent { margin-left: 25px; }
        p { margin: 3px 0; }
        .footer { margin-top: 10px; }
        .signature-box { display: inline-block; width: 45%; border-top: 1px solid #000; margin-top: 35px; text-align: center; padding-top: 5px; }
        ul { margin: 3px 0 3px 25px; padding: 0; }
        li { margin-bottom: 2px; }
        .problem-box { border: 1px solid #ccc; padding: 5px; min-height: 40px; margin-top: 3px; }
        .observation-box { border: 1px solid #ccc; padding: 5px; min-height: 70px; margin-top: 3px; margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>BANGLADESH ARMY UNIVERSITY OF SCIENCE AND TECHNOLOGY (BAUST)</h2>
        <h3>ICT Wing and Archive</h3>
        <h4>IT REPAIR CELL</h4>
        <h3>DEVICE REPAIR SUBMISSION FORM</h3>
        <p style="font-size: 10px;">Form No: BAUST/ICT/REPAIR/F-01 <span style="margin-left: 100px;">Job ID / Ticket No: <strong>{{ $request->job_id }}</strong></span></p>
    </div>

    <div class="section">
        <div class="section-title">Part A: To be filled by the Submitting Department</div>
        <p><strong>1. Submitting Department/Office:</strong> {{ $request->department }}</p>
        <p><strong>2. Submission Date:</strong> {{ $request->submission_date ? $request->submission_date->format('d-m-Y') : '' }} <strong>Time:</strong> {{ $request->submission_time }}</p>
        <p><strong>3. Contact Person:</strong> {{ $request->contact_person }} <strong>Designation:</strong> {{ $request->designation }}</p>
        <p><strong>4. Contact No:</strong> {{ $request->contact_no }} <strong>Email:</strong> {{ $request->email }}</p>
        
        <p><strong>5. Device Information:</strong></p>
        <div class="indent">
            <p><strong>A. Device Type:</strong> {{ $request->device_type }}</p>
            <p><strong>B. Brand & Model:</strong> {{ $request->brand_model }}</p>
            <p><strong>C. Asset/Inventory ID No.:</strong> {{ $request->asset_id }}</p>
            <p><strong>D. Serial Number:</strong> {{ $request->serial_number }}</p>
        </div>

        <p><strong>6. List of Submitted Accessories:</strong></p>
        <ul>
            @if(is_array($request->accessories))
                @foreach($request->accessories as $item)
                    @if(!empty($item))
                        <li>{{ $item }}</li>
                    @endif
                @endforeach
            @endif
        </ul>

        <p><strong>7. Detailed Description of the Problem / Fault:</strong></p>
        <div class="problem-box">{{ $request->problem_description }}</div>
    </div>

    <div class="footer">
        <div class="signature-box" style="float: left;">
            <span style="font-size: 9px;">Submitted By:</span><br><br>
            <span style="font-size: 9px;">(Signature & Date)</span><br>
            Name: {{ $request->contact_person }}<br>
            Designation: {{ $request->designation }}
        </div>
        <div class="signature-box" style="float: right;">
            <span style="font-size: 9px;">(Head of the Department / Authorized Person)</span><br><br><br>
            <span style="font-size: 9px;">Department Seal:</span>
        </div>
        <div style="clear: both;"></div>
    </div>

    <hr style="border: 0; border-top: 1px dashed #000; margin: 15px 0;">

    <div class="section">
        <div class="section-title">Part B: For Official Use by IT Repair Cell Only</div>
        <div style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 5px;">
            <p><strong>Job ID / Ticket No:</strong> {{ $request->job_id }} <span style="margin-left: 20px;"><strong>Date Received:</strong> {{ $request->date_received ? $request->date_received->format('d-m-Y') : ($request->submission_date ? $request->submission_date->format('d-m-Y') : '') }}</span></p>
            <p><strong>Received By (Name & Signature):</strong> {{ $request->received_by }}</p>
        </div>
        
        <div style="margin-bottom: 5px;">
            <p><strong>Initial Observation / Remarks:</strong></p>
            <div class="observation-box">{{ $request->initial_observation }}</div>
            <p><strong>Approximate Date to deliver:</strong> {{ $request->expected_delivery ? $request->expected_delivery->format('d-m-Y') : '' }}</p>
            <p><strong>Assigned to Expert:</strong> {{ $request->assigned_to }} <span style="margin-left: 20px;"><strong>Cellphone:</strong> {{ $request->assigned_phone }}</span></p>
        </div>

        <div style="border-top: 1px solid #eee; pt: 5px;">
            <p><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold;">{{ $request->status }}</span> 
               @if($request->state)<span style="margin-left: 20px;"><strong>State:</strong> {{ $request->state }}</span>@endif
            </p>
            @if($request->completed_actions)
                <p><strong>Completed Actions:</strong> {{ $request->completed_actions }}</p>
            @endif
        </div>
    </div>
</body>
</html>
