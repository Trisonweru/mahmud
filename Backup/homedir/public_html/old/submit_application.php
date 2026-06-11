<?php
session_start();
$bof_main_url = '/home/evisnglv/admin.evisasomali.com';

require_once $bof_main_url.'/config.php';

// Generate a unique reference number
function generateReferenceNumber() {
    $prefix = 'EVISA';
    $year = date('Y');
    $random = strtoupper(substr(uniqid(), -6));
    return $prefix . '-' . $year . '-' . $random;
}

function generateApplicationId() {
    $prefix = 'VISA';
    $year = date('Y');
    $random = strtoupper(substr(uniqid(), -6));
    return $prefix . '-' . $year . '-' . $random;
}

// File upload function – uses LOCAL filesystem path
function uploadFile($file, $uploadDir = 'uploads/') {
    // Ensure uploadDir is a local path, not a URL
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            error_log("Failed to create upload directory: $uploadDir");
            return null;
        }
    }

    $fileName = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($file['name']));
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Return only the filename or relative path (safe for DB)
        return $fileName;
    }
    return null;
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'message' => '', 'reference' => ''];

    try {
        // Step 1: Getting Started
        $readyCheckbox = isset($_POST['ready_checkbox']) ? 'yes' : 'no';

        // Step 2: Personal Information
        $applicantType = $_POST['applicant_type'] ?? '';
        $nationalityBirth = $_POST['nationality_birth'] ?? '';
        $countryResidence = $_POST['country_residence'] ?? '';
        $cityResidence = $_POST['city_residence'] ?? '';
        $physicalAddress = $_POST['physical_address'] ?? '';
        $maritalStatus = $_POST['marital_status'] ?? '';
        $contact = $_POST['contact'] ?? '';
        $email = $_POST['email'] ?? '';
        $passportType = $_POST['passport_type'] ?? '';
        $passportNumber = $_POST['passport_number'] ?? '';
        $dateOfIssue = $_POST['date_of_issue'] ?? '';
        $expiryDate = $_POST['expiry_date'] ?? '';

        // Define local upload directories (relative to this script)
        $selfieDir = $bof_main_url.'/uploads/selfies/';
        $passportDir = $bof_main_url.'/uploads/passports/';
        $ticketDir = $bof_main_url.'/uploads/tickets/';
        $sponsorDir = $bof_main_url.'/uploads/sponsors/';

        // Step 3: Photo/Selfie
        $selfiePhoto = null;
        if (isset($_FILES['selfie']) && $_FILES['selfie']['error'] === UPLOAD_ERR_OK) {
            $selfiePhoto = '/uploads/selfies/'.uploadFile($_FILES['selfie'], $selfieDir);
        }

        // Step 4: Travel Information (Conditional fields)
        $passportUpload = null;
        if (isset($_FILES['passport_upload']) && $_FILES['passport_upload']['error'] === UPLOAD_ERR_OK) {
            $passportUpload = '/uploads/passports/'.uploadFile($_FILES['passport_upload'], $passportDir);
        }

        $ticketUpload = null;
        if (isset($_FILES['ticket_upload']) && $_FILES['ticket_upload']['error'] === UPLOAD_ERR_OK) {
            $ticketUpload = '/uploads/tickets/'.uploadFile($_FILES['ticket_upload'], $ticketDir);
        }

        $sponsorLetter = null;
        $sponsorCode = null;
        $purposeOfVisit = null;
        $travelDate = null;
        $durationOfStay = null;
        
        // Handle conditional fields based on applicant type
        if ($applicantType === 'foreigner') {
            // Foreigner (Ajnabi) fields
            $sponsorCode = $_POST['sponsor_code'] ?? '';
            $purposeOfVisit = $_POST['purpose_of_visit'] ?? '';
            $travelDate = $_POST['travel_date'] ?? '';
            $durationOfStay = $_POST['duration_of_stay'] ?? '';
            
            if (isset($_FILES['sponsor_letter']) && $_FILES['sponsor_letter']['error'] === UPLOAD_ERR_OK) {
                $sponsorLetter = '/uploads/sponsors/'.uploadFile($_FILES['sponsor_letter'], $sponsorDir);
            }
        } elseif ($applicantType === 'somali_foreign') {
            // Somali-foreigner (Qurba-Joog) fields
            $purposeOfVisit = $_POST['purpose_of_visit_somali'] ?? '';
            $durationOfStay = $_POST['duration_of_stay_somali'] ?? '';
            $travelDate = $_POST['travel_date_somali'] ?? '';
        }

        // Step 5: Address in Somalia
        $addressSomalia = $_POST['address'] ?? '';
        $placeSomalia = $_POST['place'] ?? '';
        $hostContact = $_POST['host_contact'] ?? '';
        $hostEmail = $_POST['email_host'] ?? '';

        // Step 6: Travel History
        $visitedSomalia = $_POST['visited'] ?? '';

        // Step 7: Security Questions
        $convicted = $_POST['convicted'] ?? '';
        $refusedEntry = $_POST['refused_entry'] ?? '';
        $seriousCrimes = $_POST['serious_crimes'] ?? '';
        $terrorism = $_POST['terrorism'] ?? '';
        $glorifyTerrorism = $_POST['glorify_terrorism'] ?? '';
        $falseInfo = $_POST['false_info'] ?? '';
        $cybercrime = $_POST['cybercrime'] ?? '';

        // Step 8: Declaration
        $agreeTerms = isset($_POST['agree']) ? 'yes' : 'no';

        // Generate IDs
        $applicationId = generateApplicationId();
        $referenceNumber = generateReferenceNumber();

        // Insert into database
        $stmt = $con->prepare("INSERT INTO visa_applications (
            application_id, reference_number, ready_checkbox, applicant_type, nationality_birth,
            country_residence, city_residence, physical_address, marital_status, contact,
            email, passport_type, passport_number, date_of_issue, expiry_date, passport_upload,
            selfie_photo, ticket_upload, sponsor_letter, address_somalia, place_somalia,
            host_contact, host_email, visited_somalia, convicted, refused_entry,
            serious_crimes, terrorism, glorify_terrorism, false_info, cybercrime, agree_terms,
            sponsor_code, purpose_of_visit, travel_date, duration_of_stay
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->bind_param(
            "ssssssssssssssssssssssssssssssssssss",
            $applicationId, $referenceNumber, $readyCheckbox, $applicantType, $nationalityBirth,
            $countryResidence, $cityResidence, $physicalAddress, $maritalStatus, $contact,
            $email, $passportType, $passportNumber, $dateOfIssue, $expiryDate, $passportUpload,
            $selfiePhoto, $ticketUpload, $sponsorLetter, $addressSomalia, $placeSomalia,
            $hostContact, $hostEmail, $visitedSomalia, $convicted, $refusedEntry,
            $seriousCrimes, $terrorism, $glorifyTerrorism, $falseInfo, $cybercrime, $agreeTerms,
            $sponsorCode, $purposeOfVisit, $travelDate, $durationOfStay
        );

        if ($stmt->execute()) {
            $response['success'] = true;
            $response['message'] = 'Application submitted successfully!';
            $response['reference'] = $referenceNumber;
        } else {
            $response['message'] = 'Database error: ' . $stmt->error;
        }

        $stmt->close();

    } catch (Exception $e) {
        $response['message'] = 'Error: ' . $e->getMessage();
        error_log('Application submission error: ' . $e->getMessage());
    }

    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>