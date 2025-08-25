<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{
    public function sendEmail(){

        Mail::to('asifiqbal2097@gmail.com')->send(new WelcomeMail());
        return 'Email sent';

    }
}
