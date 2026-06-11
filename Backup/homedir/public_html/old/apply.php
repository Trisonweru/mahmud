<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>eTAS Application</title>
  <link rel="icon" type="image/png" href="img/somalia_fav.jpg">
  <script src="https://unpkg.com/tesseract.js@5.0.3/dist/tesseract.min.js"></script>
  <!-- Bootstrap 5.3 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <!-- Inter Font -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">
  <style>
    /* Top step nav */
    .top-steps {
      display:flex;
      gap:8px;
      align-items:center;
      justify-content:space-between;
      flex-wrap:wrap;
      background: #fff;
      padding: 10px 14px;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(12, 25, 60, 0.06);
      margin-bottom: 16px;
    }
    .steps-list {
      display:flex;
      gap: 8px;
      align-items:center;
      overflow:auto;
      -webkit-overflow-scrolling: touch;
    }
    .step-item {
      display:flex;
      gap:8px;
      align-items:center;
      padding:8px 12px;
      border-radius: 8px;
      cursor:pointer;
      color:var(--muted);
      font-weight:600;
      transition: transform .18s ease, box-shadow .18s ease, color .18s;
      white-space: nowrap;
      flex: 0 0 auto;
    }
    .step-item .badge-step {
      min-width:30px; height:30px; display:grid; place-items:center; border-radius:8px;
      background: #f1f5ff; color:var(--primary); font-weight:700;
    }
    .step-item.active,
    .step-item.completed {
      color: var(--primary);
      box-shadow: 0 6px 18px rgba(13,110,253,0.08);
      transform: translateY(-3px);
    }
    .step-item.locked { opacity: 0.5; cursor: not-allowed; transform:none; box-shadow:none; color:var(--muted); }
    /* small screen: collapse into dropdown */
    .step-dropdown { display:none; }
    @media (max-width: 767.98px) {
      .steps-list { display:none; }
      .step-dropdown { display:block; }
    }
    /* progress bar */
    .progress-wrap { padding: 6px 0 0 0; margin-bottom:12px; }
    .progress { height: 8px; border-radius: 999px; overflow:visible; background:#e9ecef; }
    .progress .progress-bar { transition: width .5s ease-in-out; background:var(--primary); }
    /* step cards */
    .card-wizard {
      border-radius: var(--card-radius);
      box-shadow: 0 10px 30px rgba(12,25,60,0.06);
      overflow: hidden;
    }
    .card-body { padding: 28px; }
    /* content animation */
    .step-content { display:none; opacity:0; transform: translateX(20px); transition: all .35s ease; }
    .step-content.active { display:block; opacity:1; transform: translateX(0); }
    /* invalid */
    .is-invalid { border: 2px solid #dc3545 !important; box-shadow: 0 0 0 4px rgba(220,53,69,0.06); }
    /* nav bottom buttons */
    .nav-row { margin-top:18px; }
    /* subtle icon style */
    .step-icon { font-size: 16px; }
    /* collapse behavior for mobile */
    .mobile-collapsible { display:none; }
    @media (max-width:767.98px) {
      .mobile-collapsible { display:block; }
    }
  </style>
</head>
<body>
<?php $page='applications'; include 'header.php';?>
<section class="hero-about text-center py-8 text-white">
  <div class="container py-5">
    <h2 class="display-4 fw-bold" style="font-size:2.8em">Start Your eTAS Application</h2>
  </div>
</section>
<div class="container my-4">
  <!-- Top nav + progress -->
  <div class="top-steps mb-3">
    <div class="steps-list" id="stepsList">
      <div class="step-item active" data-step="1">
        <div class="badge-step">1</div>
        <div><i class="bi bi-info-circle step-icon"></i>&nbsp;<small>Getting Started</small></div>
      </div>
      <div class="step-item locked" data-step="2">
        <div class="badge-step">2</div>
        <div><i class="bi bi-person-fill step-icon"></i>&nbsp;<small>Personal Info</small></div>
      </div>
      <div class="step-item locked" data-step="3">
        <div class="badge-step">3</div>
        <div><i class="bi bi-camera-fill step-icon"></i>&nbsp;<small>Photos</small></div>
      </div>
      <div class="step-item locked" data-step="4">
        <div class="badge-step">4</div>
        <div><i class="bi bi-geo-alt-fill step-icon"></i>&nbsp;<small>Travel Info</small></div>
      </div>
      <div class="step-item locked" data-step="5">
        <div class="badge-step">5</div>
        <div><i class="bi bi-house-fill step-icon"></i>&nbsp;<small>Address</small></div>
      </div>
      <div class="step-item locked" data-step="6">
        <div class="badge-step">6</div>
        <div><i class="bi bi-clock-history step-icon"></i>&nbsp;<small>History</small></div>
      </div>
      <div class="step-item locked" data-step="7">
        <div class="badge-step">7</div>
        <div><i class="bi bi-shield-fill-check step-icon"></i>&nbsp;<small>Security</small></div>
      </div>
      <div class="step-item locked" data-step="8">
        <div class="badge-step">8</div>
        <div><i class="bi bi-journal-check step-icon"></i>&nbsp;<small>Declaration</small></div>
      </div>
    </div>
    <!-- mobile dropdown -->
    <div class="step-dropdown ms-auto">
      <div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="mobileStepsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          Step <span id="mobileStepLabel">1</span>
        </button>
        <ul class="dropdown-menu" aria-labelledby="mobileStepsDropdown" id="mobileStepsMenu">
          <li><a class="dropdown-item" href="#" data-step="1">01 — Getting Started</a></li>
          <li><a class="dropdown-item disabled" href="#" data-step="2">02 — Personal Information</a></li>
          <li><a class="dropdown-item disabled" href="#" data-step="3">03 — Selfie / Photo</a></li>
          <li><a class="dropdown-item disabled" href="#" data-step="4">04 — Travel Information</a></li>
          <li><a class="dropdown-item disabled" href="#" data-step="5">05 — Physical Address</a></li>
          <li><a class="dropdown-item disabled" href="#" data-step="6">06 — Travel History</a></li>
          <li><a class="dropdown-item disabled" href="#" data-step="7">07 — Security Questions</a></li>
          <li><a class="dropdown-item disabled" href="#" data-step="8">08 — Declaration</a></li>
        </ul>
      </div>
    </div>
  </div>
  <!-- progress -->
  <div class="progress-wrap">
    <div class="progress card-wizard">
      <div class="progress-bar" role="progressbar" style="width: 0%" id="wizardProgress"></div>
    </div>
  </div>
  <!-- form card -->
  <div class="card card-wizard">
    <div class="card-body">
      <form id="visaForm" novalidate enctype="multipart/form-data">
        <!-- Step 1 -->
        <div class="step-content active" id="step-1">
          <h4>01 — Getting Started</h4>
          <p>Have the following ready: passport biodata, photo, selfie and travel bookings.</p>
          <div class="form-check my-3">
            <input class="form-check-input required-checkbox" type="checkbox" id="readyCheckbox" name="ready_checkbox">
            <label class="form-check-label" for="readyCheckbox">
              I confirm I have all required documents ready. <span class="text-danger">*</span>
            </label>
          </div>
          <div class="d-flex justify-content-between nav-row">
            <div></div>
            <div>
              <button type="button" class="btn btn-outline-secondary prev-step" disabled>Back</button>
              <button type="button" class="btn btn-primary next-step" id="nextBtn1">Next</button>
            </div>
          </div>
        </div>
        <!-- Step 2 -->
        
        
        
        
<!-- Step 2 -->
<div class="step-content" id="step-2">
  <h4>02 — Personal Information</h4>

  <!-- OCR Toggle -->
  <div class="form-check mb-3">
    <input class="form-check-input" type="checkbox" id="use_ocr" name="use_ocr" checked>
    <label class="form-check-label" for="use_ocr">
      Use OCR to auto-fill passport details (recommended)
    </label>
  </div>

  <!-- Passport Upload Section -->
  <div class="mb-4">
    <label class="form-label fw-semibold">Passport Document Upload</label>
    <div id="passport-upload-zone"
         class="border rounded-3 bg-light d-flex flex-column align-items-center justify-content-center p-4 text-center cursor-pointer"
         style="min-height: 180px; transition: all 0.25s ease;">
      <i class="bi bi-passport fs-1 text-primary mb-2"></i>
      <p class="text-muted mb-1"><small>Drag & drop your passport here</small></p>
      <p class="text-muted mb-2"><small>or</small></p>
      <button type="button" class="btn btn-outline-primary btn-sm px-4">Browse Files</button>
      <p class="mt-2 mb-0"><small class="text-secondary">JPG or PNG only • Clear scan required</small></p>
      <input type="file"
             accept="image/*"
             class="form-control required-input d-none"
             id="passport_upload"
             name="passport_upload">
    </div>
    <div class="mt-2" id="passport-preview" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;"></div>
    <div id="passport-error" class="text-danger mt-1" style="min-height: 1.2rem; font-size: 0.875rem;"></div>
    <div id="ocr-status" class="mt-2" style="min-height: 1.5rem; font-size: 0.9rem;"></div>
  </div>

  <!-- Rest of Step 2 (unchanged except minor cleanup) -->
  <div class="row g-3 mb-3">
    <div class="col-md-6">
      <label class="form-label">Type of Applicant</label>
      <div class="form-check">
        <input class="form-check-input required-radio" type="radio" name="applicant_type" id="foreigner" value="foreigner">
        <label class="form-check-label" for="foreigner">I am a foreigner (Ajnabi)</label>
      </div>
      <div class="form-check">
        <input class="form-check-input required-radio" type="radio" name="applicant_type" id="somali_foreign" value="somali_foreign">
        <label class="form-check-label" for="somali_foreign">I am a national living abroad</label>
      </div>
    </div>
    <div class="col-md-6" id="nationality-birth-container">
      <label class="form-label">Nationality at Birth</label>
      <select class="form-select" name="nationality_birth">
        <option value="">Select value</option>
        <!-- (all country options as before) -->
        <option value="Afghanistan">Afghanistan</option>
        <!-- ... rest of countries ... -->
        <option value="Zimbabwe">Zimbabwe</option>
      </select>
    </div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-md-6">
      <label class="form-label">Country of Residence</label>
      <select class="form-select required-input" name="country_residence">
        <option value="">Select value</option>
        <!-- (same country list) -->
        <option value="Afghanistan">Afghanistan</option>
        <!-- ... -->
        <option value="Zimbabwe">Zimbabwe</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label">City of Residence</label>
      <input type="text" class="form-control required-input" name="city_residence" placeholder="Enter city">
    </div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-md-6">
      <label class="form-label">Physical Address</label>
      <input type="text" class="form-control required-input" name="physical_address" placeholder="Enter physical address">
    </div>
    <div class="col-md-6">
      <label class="form-label">Marital Status</label>
      <select class="form-select required-input" name="marital_status">
        <option value="" disabled>Select value</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option>
        <option value="Widowed">Widowed</option>
      </select>
    </div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-md-6">
      <label class="form-label">Contact</label>
      <input type="text" class="form-control required-input" name="contact" placeholder="Phone number or other contact">
    </div>
    <div class="col-md-6">
      <label class="form-label">Email</label>
      <input type="email" class="form-control required-input" name="email" placeholder="you@example.com">
    </div>
  </div>

  <!-- Passport Details (auto-fillable) -->
  <div class="row g-3 mb-3">
    <div class="col-md-6">
      <label class="form-label">Type of Passport</label>
      <select class="form-select required-input" name="passport_type">
        <option value="">Type of Passport</option>
        <option value="Ordinary">Ordinary</option>
        <option value="Travel Document">Travel Document</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label">Passport Number</label>
      <input type="text" class="form-control required-input" name="passport_number" placeholder="Enter passport number" id="passport_number">
    </div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-md-6">
      <label class="form-label">Date of Issue</label>
      <input type="date" class="form-control required-input" name="date_of_issue" id="date_of_issue" max="<?= date('Y-m-d') ?>">
    </div>
    <div class="col-md-6">
      <label class="form-label">Expiry Date</label>
      <input type="date" class="form-control required-input" name="expiry_date" id="expiry_date" min="<?= date('Y-m-d', strtotime('+6 months')) ?>">
      <div id="expiry-date-error" class="text-danger mt-1" style="min-height: 1.2rem;"></div>
    </div>
  </div>

  <div class="d-flex justify-content-between nav-row">
    <button type="button" class="btn btn-secondary prev-step">Back</button>
    <button type="button" class="btn btn-primary next-step" id="nextBtn2">Next</button>
  </div>
</div>



        <!-- Step 3 -->
        <div class="step-content" id="step-3">
          <h4>03 — Photo / Selfie</h4>
          <div class="row g-3">
            <div class="col-md-12">
              <label class="form-label">Selfie <span class="text-danger">*</span></label>
                <div id="selfie-upload-zone"
                     class="border rounded-3 bg-light d-flex flex-column align-items-center justify-content-center p-4 text-center cursor-pointer"
                     style="min-height: 180px; transition: all 0.25s ease;">
                  <i class="bi bi-camera fs-1 text-primary mb-2"></i>
                  <p class="text-muted mb-2"><small>Take a new selfie or upload an existing photo</small></p>
                  <div class="d-flex gap-2 mb-2">
                      <button type="button" class="btn btn-outline-secondary btn-sm px-3" id="browseFileBtn">Upload Photo</button>
                    <button type="button" class="btn btn-outline-primary btn-sm px-3" id="takeSelfieBtn">Take Selfie</button>
                  </div>
                  <p class="mt-2 mb-0"><small class="text-secondary">Image only • White Background</small></p>
                  <input type="file"
                         accept="image/*"
                         capture="user"
                         class="d-none"
                         id="selfie_camera_input"
                         name="selfie">
                  <input type="file"
                         accept="image/*"
                         class="d-none"
                         id="selfie_file_input"
                         name="selfie">
                </div>
                <!-- ✅ PREVIEW ON RIGHT -->
                <div class="mt-2" id="selfie-preview" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;"></div>
                <div id="selfie-error" class="text-danger mt-1" style="min-height: 1.2rem; font-size: 0.875rem;"></div>
            </div>
          </div>
          <div class="d-flex justify-content-between nav-row">
            <button type="button" class="btn btn-secondary prev-step">Back</button>
            <button type="button" class="btn btn-primary next-step" id="nextBtn3">Next</button>
          </div>
        </div>
        <!-- Step 4 -->
        <div class="step-content" id="step-4">
          <h4>04 — Travel Information</h4>
          <div class="row g-3">
            <!-- ... other fields unchanged ... -->
            <!-- Flight Ticket Upload -->
            <div class="mb-2 col-md-12">
              <label class="form-label fw-semibold">Flight Ticket Upload <span class="text-danger">*</span></label>
              <div id="ticket-upload-zone"
                   class="border rounded-3 bg-light d-flex flex-column align-items-center justify-content-center p-4 text-center cursor-pointer"
                   style="min-height: 180px; transition: all 0.25s ease;">
                <i class="bi bi-airplane fs-1 text-primary mb-2"></i>
                <p class="text-muted mb-1"><small>Drag & drop your flight ticket here</small></p>
                <p class="text-muted mb-2"><small>or</small></p>
                <button type="button" class="btn btn-outline-primary btn-sm px-4">Browse Files</button>
                <p class="mt-2 mb-0"><small class="text-secondary">JPG, PNG, or PDF • Clear scan required</small></p>
                <input type="file"
                       accept="image/*,application/pdf"
                       class="form-control required-input d-none"
                       id="ticket_upload"
                       name="ticket_upload">
              </div>
              <!-- ✅ PREVIEW ON RIGHT -->
              <div class="mt-2" id="ticket-preview" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;"></div>
              <div id="ticket-error" class="text-danger mt-1" style="min-height: 1.2rem; font-size: 0.875rem;"></div>
            </div>
            <!-- Sponsor Letter Upload -->
            <div class="mb-2 col-md-12">
              <label for="sponsorLetter" class="form-label">Upload Sponsor Letter <span class="text-danger">*</span></label>
              <div id="sponsor-letter-upload-zone"
                   class="border rounded-3 bg-light d-flex flex-column align-items-center justify-content-center p-4 text-center cursor-pointer"
                   style="min-height: 180px; transition: all 0.25s ease;">
                <i class="bi bi-file-earmark-text fs-1 text-primary mb-2"></i>
                <p class="text-muted mb-1"><small>Drag & drop your sponsor letter here</small></p>
                <p class="text-muted mb-2"><small>or</small></p>
                <button type="button" class="btn btn-outline-primary btn-sm px-4">Browse Files</button>
                <p class="mt-2 mb-0"><small class="text-secondary">JPG, PNG, or PDF • Clear scan required</small></p>
                <input type="file"
                       accept="image/*,application/pdf"
                       class="form-control required-input d-none"
                       id="sponsorLetter"
                       name="sponsor_letter">
              </div>
              <!-- ✅ PREVIEW ON RIGHT -->
              <div class="mt-2" id="sponsor-letter-preview" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;"></div>
              <div id="sponsor-letter-error" class="text-danger mt-1" style="min-height: 1.2rem; font-size: 0.875rem;"></div>
            </div>
          </div>
          <div class="d-flex justify-content-between nav-row">
            <button type="button" class="btn btn-secondary prev-step">Back</button>
            <button type="button" class="btn btn-primary next-step" id="nextBtn4">Next</button>
          </div>
        </div>
        <!-- Step 5 -->
        <div class="step-content" id="step-5">
          <h4>05 — Physical Address at Destination</h4>
          <div class="row g-3">
            <div class="col-md-6 mb-3">
              <label class="form-label">Physical Address <span class="text-danger">*</span></label>
              <input type="text" class="form-control required-input" name="address" placeholder="Hotel name or street">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Place <span class="text-danger">*</span></label>
              <input type="text" class="form-control required-input" name="place" placeholder="Place">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Contact Number (Host)<span class="text-danger">*</span></label>
              <input type="text" class="form-control required-input" name="host_contact" placeholder="Host contact number">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Email (Host)<span class="text-danger">*</span></label>
              <input type="email" class="form-control required-input" name="email_host" placeholder="host@example.com">
            </div>
          </div>
          <div class="d-flex justify-content-between nav-row">
            <button type="button" class="btn btn-secondary prev-step">Back</button>
            <button type="button" class="btn btn-primary next-step" id="nextBtn5">Next</button>
          </div>
        </div>
        <!-- Step 6 -->
        <div class="step-content" id="step-6">
          <h4>06 — Travel History</h4>
          <label class="form-label">Have you visited this destination before? <span class="text-danger">*</span></label>
          <div class="mb-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="visited" id="visitedYes" value="yes">
              <label class="form-check-label" for="visitedYes">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="visited" id="visitedNo" value="no">
              <label class="form-check-label" for="visitedNo">No</label>
            </div>
          </div>
          <div class="d-flex justify-content-between nav-row">
            <button type="button" class="btn btn-secondary prev-step">Back</button>
            <button type="button" class="btn btn-primary next-step" id="nextBtn6">Next</button>
          </div>
        </div>
        <!-- Step 7 -->
        <div class="step-content" id="step-7">
          <h4>07 — Security Questions</h4>
          <!-- Q1: Convicted? -->
          <label class="form-label">Have you ever been convicted? <span class="text-danger">*</span></label>
          <div class="mb-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="convicted" id="convicted_yes" value="yes">
              <label class="form-check-label" for="convicted_yes">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="convicted" id="convicted_no" value="no">
              <label class="form-check-label" for="convicted_no">No</label>
            </div>
          </div>
          <!-- Q2: Refused entry or deported? -->
          <label class="form-label">Have you ever been refused entry or deported by any country? <span class="text-danger">*</span></label>
          <div class="mb-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="refused_entry" id="refused_entry_yes" value="yes">
              <label class="form-check-label" for="refused_entry_yes">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="refused_entry" id="refused_entry_no" value="no">
              <label class="form-check-label" for="refused_entry_no">No</label>
            </div>
          </div>
          <!-- Q3: Human/drug trafficking, abuse, fraud? -->
          <label class="form-label">Have you ever been engaged in human trafficking, drug trafficking, child abuse, crimes against women, economic offense or financial fraud? <span class="text-danger">*</span></label>
          <div class="mb-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="serious_crimes" id="serious_crimes_yes" value="yes">
              <label class="form-check-label" for="serious_crimes_yes">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="serious_crimes" id="serious_crimes_no" value="no">
              <label class="form-check-label" for="serious_crimes_no">No</label>
            </div>
          </div>
          <!-- Q4: Terrorist activities, violence? -->
          <label class="form-label">Have you ever been engaged in terrorist activities, sabotage, espionage, genocide, political killing or other act of violence? <span class="text-danger">*</span></label>
          <div class="mb-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="terrorism" id="terrorism_yes" value="yes">
              <label class="form-check-label" for="terrorism_yes">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="terrorism" id="terrorism_no" value="no">
              <label class="form-check-label" for="terrorism_no">No</label>
            </div>
          </div>
          <!-- Q5: Glorify terrorist violence? -->
          <label class="form-label">Have you ever, by any means or medium, expressed views that justify or glorify terrorist violence or that may encourage others to terrorist acts or other serious criminal acts? <span class="text-danger">*</span></label>
          <div class="mb-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="glorify_terrorism" id="glorify_terrorism_yes" value="yes">
              <label class="form-check-label" for="glorify_terrorism_yes">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="glorify_terrorism" id="glorify_terrorism_no" value="no">
              <label class="form-check-label" for="glorify_terrorism_no">No</label>
            </div>
          </div>
          <!-- Q6: False info on visa application? -->
          <label class="form-label">Have you ever provided false information on a travel authorization application or to an immigration officer? <span class="text-danger">*</span></label>
          <div class="mb-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="false_info" id="false_info_yes" value="yes">
              <label class="form-check-label" for="false_info_yes">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="false_info" id="false_info_no" value="no">
              <label class="form-check-label" for="false_info_no">No</label>
            </div>
          </div>
          <!-- Q7: Cybercrime or hacking? -->
          <label class="form-label">Have you ever engaged in cybercrime, hacking, or unauthorized access to computer systems? <span class="text-danger">*</span></label>
          <div class="mb-3">
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="cybercrime" id="cybercrime_yes" value="yes">
              <label class="form-check-label" for="cybercrime_yes">Yes</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input required-radio" type="radio" name="cybercrime" id="cybercrime_no" value="no">
              <label class="form-check-label" for="cybercrime_no">No</label>
            </div>
          </div>
          <div class="d-flex justify-content-between nav-row">
            <button type="button" class="btn btn-secondary prev-step">Back</button>
            <button type="button" class="btn btn-primary next-step" id="nextBtn7">Next</button>
          </div>
        </div>
        <!-- Step 8 -->
        <div class="step-content" id="step-8">
          <h4>08 — Declaration</h4>
          <p>By submitting, you confirm all information provided is accurate.</p>
          <div class="form-check mb-3">
            <input class="form-check-input required-checkbox" type="checkbox" id="agree" name="agree">
            <label class="form-check-label" for="agree">I agree to the terms and confirm my information is correct. <span class="text-danger">*</span></label>
          </div>
          <div class="d-flex justify-content-between nav-row">
            <button type="button" class="btn btn-secondary prev-step">Back</button>
            <button type="submit" class="btn btn-success" id="submitBtn" disabled>Submit Application</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Privacy & Terms Modal -->
<div class="modal fade" id="privacyModal" tabindex="-1" aria-labelledby="privacyModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg">
      <div class="modal-header border-0">
        <h5 class="modal-title fw-bold" id="privacyModalLabel">Privacy & Terms Acceptance</h5>
      </div>
      <div class="modal-body">
        By using this portal, you agree to our 
        <a href="privacy"><b>Privacy Policy</b></a> 
        and 
        <a href="terms"><b>Terms of Service</b></a>.
      </div>
      <div class="modal-footer border-0">
        <button id="acceptPrivacy" class="btn btn-primary px-4 py-2">I Agree</button>
      </div>
    </div>
  </div>
</div>

<?php include 'footer.php';?>

<!-- Bootstrap -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>
/* ---------- Globals ---------- */
const totalSteps = 8;
let currentStep = 1;
const stepItems = document.querySelectorAll('.step-item');
const stepContents = document.querySelectorAll('.step-content');
const progressBar = document.getElementById('wizardProgress');
const mobileStepLabel = document.getElementById('mobileStepLabel');
const mobileMenu = document.getElementById('mobileStepsMenu');

function showStep(n) {
  if (n < 1 || n > totalSteps) return;
  currentStep = n;
  stepContents.forEach(c => c.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
  stepItems.forEach(item => {
    const s = Number(item.getAttribute('data-step'));
    item.classList.remove('active');
    if (s < n) item.classList.add('completed');
    else item.classList.remove('completed');
    if (s === n) item.classList.add('active');
  });
  if (mobileStepLabel) mobileStepLabel.textContent = n;
  const pct = Math.round(((n - 1) / (totalSteps - 1)) * 100);
  progressBar.style.width = pct + '%';
  updateButtons();
}

/* ---------- Validation ---------- */
function validateStep(stepNumber) {
  const step = document.getElementById('step-' + stepNumber);
  const requiredInputs = step.querySelectorAll('.required-input');
  const requiredRadios = step.querySelectorAll('.required-radio');
  const requiredCheckboxes = step.querySelectorAll('.required-checkbox');
  let valid = true;

  // Clear previous errors
  step.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.text-danger').forEach(el => {
    if (['passport-error','selfie-error','ticket-error','sponsor-letter-error','expiry-date-error'].includes(el.id)) {
      el.textContent = '';
    }
  });

  // Standard inputs
  requiredInputs.forEach(inp => {
    if (window.getComputedStyle(inp.closest('.col-md-6') || inp).display === 'none') return;
    if (!inp.value || inp.value.trim() === '') {
      inp.classList.add('is-invalid');
      valid = false;
    } else if (inp.type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
      if (!ok) {
        inp.classList.add('is-invalid');
        valid = false;
      }
    }
  });

  // ✅ Passport expiry ≥ 6 months
  if (stepNumber === 2) {
    const expiryInput = document.querySelector('input[name="expiry_date"]');
    if (expiryInput.value) {
      const expiry = new Date(expiryInput.value);
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() + 6);
      if (expiry < cutoff) {
        expiryInput.classList.add('is-invalid');
        valid = false;
        document.getElementById('expiry-date-error').textContent = 'Passport must be valid for at least 6 months.';
      }
    }
    // File validation
    const passportInput = document.getElementById('passport_upload');
    const errorDiv = document.getElementById('passport-error');
    const uploadZone = document.getElementById('passport-upload-zone');
    if (!passportInput.files || passportInput.files.length === 0) {
      uploadZone.style.borderColor = '#dc3545';
      uploadZone.style.borderWidth = '2px';
      errorDiv.textContent = 'Passport document is required.';
      valid = false;
    } else {
      uploadZone.style.borderColor = '';
      uploadZone.style.borderWidth = '';
    }
  }

  // Selfie validation
  if (stepNumber === 3) {
    const cameraFile = document.getElementById('selfie_camera_input').files[0];
    const browseFile = document.getElementById('selfie_file_input').files[0];
    const hasFile = cameraFile || browseFile;
    const errorDiv = document.getElementById('selfie-error');
    const uploadZone = document.getElementById('selfie-upload-zone');
    if (!hasFile) {
      uploadZone.style.borderColor = '#dc3545';
      uploadZone.style.borderWidth = '2px';
      errorDiv.textContent = 'A selfie/photo is required.';
      valid = false;
    } else {
      uploadZone.style.borderColor = '';
      uploadZone.style.borderWidth = '';
    }
  }

  // Step 4 file validations
  if (stepNumber === 4) {
    // Flight Ticket
    const ticketInput = document.getElementById('ticket_upload');
    const ticketErrorDiv = document.getElementById('ticket-error');
    const ticketUploadZone = document.getElementById('ticket-upload-zone');
    if (!ticketInput.files || ticketInput.files.length === 0) {
      ticketUploadZone.style.borderColor = '#dc3545';
      ticketUploadZone.style.borderWidth = '2px';
      ticketErrorDiv.textContent = 'Flight ticket is required.';
      valid = false;
    } else {
      ticketUploadZone.style.borderColor = '';
      ticketUploadZone.style.borderWidth = '';
    }
    // Sponsor Letter
    const sponsorLetterInput = document.getElementById('sponsorLetter');
    const sponsorLetterErrorDiv = document.getElementById('sponsor-letter-error');
    const sponsorLetterUploadZone = document.getElementById('sponsor-letter-upload-zone');
    if (!sponsorLetterInput.files || sponsorLetterInput.files.length === 0) {
      sponsorLetterUploadZone.style.borderColor = '#dc3545';
      sponsorLetterUploadZone.style.borderWidth = '2px';
      sponsorLetterErrorDiv.textContent = 'Sponsor letter is required.';
      valid = false;
    } else {
      sponsorLetterUploadZone.style.borderColor = '';
      sponsorLetterUploadZone.style.borderWidth = '';
    }
  }

  // ✅ Step 7: Explicit security question enforcement
  if (stepNumber === 7) {
    const securityFields = ['convicted', 'refused_entry', 'serious_crimes', 'terrorism', 'glorify_terrorism', 'false_info', 'cybercrime'];
    for (const name of securityFields) {
      const checked = step.querySelector(`input[name="${name}"]:checked`);
      if (!checked) {
        valid = false;
        step.querySelectorAll(`input[name="${name}"]`).forEach(el => el.classList.add('is-invalid'));
      }
    }
  }

  // Radio groups
  const radioNames = new Set(Array.from(requiredRadios).map(r => r.name));
  radioNames.forEach(name => {
    const group = step.querySelectorAll('input[name="' + name + '"]');
    const checked = Array.from(group).some(g => g.checked);
    if (!checked) {
      group.forEach(g => g.classList.add('is-invalid'));
      valid = false;
    }
  });

  // Checkboxes
  requiredCheckboxes.forEach(cb => {
    if (!cb.checked) {
      cb.classList.add('is-invalid');
      valid = false;
    }
  });

  return valid;
}

/* ---------- Button logic ---------- */
function updateButtons() {
  stepItems.forEach(item => {
    const s = Number(item.getAttribute('data-step'));
    if (s <= currentStep) item.classList.remove('locked');
    else item.classList.add('locked');
  });
  const submitBtn = document.getElementById('submitBtn');
  if (currentStep === totalSteps) {
    submitBtn.disabled = !validateStep(totalSteps);
  } else if (submitBtn) {
    submitBtn.disabled = true;
  }
  const activeContent = document.querySelector('.step-content.active');
  const nextBtn = activeContent.querySelector('.next-step');
  const prevBtn = activeContent.querySelector('.prev-step');
  if (nextBtn) nextBtn.disabled = !validateStep(currentStep);
  if (prevBtn) prevBtn.disabled = (currentStep === 1);
  Array.from(mobileMenu.querySelectorAll('a')).forEach(a => {
    const s = Number(a.getAttribute('data-step'));
    if (s <= currentStep) a.classList.remove('disabled');
    else a.classList.add('disabled');
  });
}

/* ---------- Listeners ---------- */
stepItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const target = Number(item.getAttribute('data-step'));
    if (target <= currentStep) showStep(target);
  });
});

Array.from(mobileMenu.querySelectorAll('a')).forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const s = Number(a.getAttribute('data-step'));
    if (!a.classList.contains('disabled')) showStep(s);
  });
});

document.querySelectorAll('.next-step').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (validateStep(currentStep)) {
      const curItem = document.querySelector('.step-item[data-step="'+currentStep+'"]');
      if (curItem) curItem.classList.add('completed');
      const nextItem = document.querySelector('.step-item[data-step="'+(currentStep+1)+'"]');
      if (nextItem) nextItem.classList.remove('locked');
      showStep(currentStep + 1);
    } else {
      const content = document.querySelector('.step-content.active');
      content.classList.remove('animate-shake');
      void content.offsetWidth;
      content.classList.add('animate-shake');
      setTimeout(()=> content.classList.remove('animate-shake'), 500);
    }
  });
});

document.querySelectorAll('.prev-step').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (currentStep > 1) showStep(currentStep - 1);
  });
});

document.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', () => updateButtons());
  el.addEventListener('change', () => updateButtons());
});

// Form submit
document.getElementById('visaForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!validateStep(totalSteps)) {
    updateButtons();
    alert('Please complete all required fields before submitting.');
    return;
  }
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
  const formData = new FormData(this);
  fetch('submit_application.php', {
    method: 'POST',
    body: formData,
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('✅ Application submitted successfully!\nReference: ' + (data.reference || 'N/A'));
    } else {
      alert('❌ Submission failed:\n' + (data.message || 'Unknown error'));
    }
  })
  .catch(error => {
    console.error('Submission error:', error);
    alert('⚠️ Network or server error. Please try again later.');
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  });
});

/* ---------- Swipe support ---------- */
let touchStartX = 0;
let touchEndX = 0;
function handleGesture() {
  const threshold = 60;
  if (touchEndX < touchStartX - threshold && currentStep < totalSteps && validateStep(currentStep)) {
    showStep(currentStep + 1);
  }
  if (touchEndX > touchStartX + threshold && currentStep > 1) {
    showStep(currentStep - 1);
  }
}
document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, {passive:true});
document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
}, {passive:true});

/* ---------- UI Helpers ---------- */
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shakeX {
  0% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}
.animate-shake { animation: shakeX .45s ease; }
`;
document.head.appendChild(styleSheet);

/* ---------- Generic Preview Renderer ---------- */
function renderPreview(file, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!file) return;
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      container.innerHTML = `<img src="${e.target.result}" style="max-width:120px; max-height:120px; border-radius:4px;">`;
    };
    reader.readAsDataURL(file);
  } else if (file.type === 'application/pdf') {
    container.innerHTML = `<div style="display:flex; align-items:center; gap:8px;">
      <i class="bi bi-file-pdf text-danger fs-3"></i>
      <span>${file.name}</span>
    </div>`;
  }
}

/* ---------- Passport Upload Logic ---------- */
document.addEventListener('DOMContentLoaded', function () {
  const uploadZone = document.getElementById('passport-upload-zone');
  const fileInput = document.getElementById('passport_upload');
  const errorDiv = document.getElementById('passport-error');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.querySelector('button').addEventListener('click', (e) => {
    e.stopPropagation(); fileInput.click();
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    renderPreview(file, 'passport-preview');
    errorDiv.textContent = '';
    updateButtons();
  });
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('bg-white', 'border-primary'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('bg-white', 'border-primary'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('bg-white', 'border-primary');
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInput.files = e.dataTransfer.files;
      renderPreview(file, 'passport-preview');
      errorDiv.textContent = '';
      updateButtons();
    }
  });
});

/* ---------- Selfie Upload Logic ---------- */
document.addEventListener('DOMContentLoaded', function () {
  const takeSelfieBtn = document.getElementById('takeSelfieBtn');
  const browseFileBtn = document.getElementById('browseFileBtn');
  const cameraInput = document.getElementById('selfie_camera_input');
  const fileInput = document.getElementById('selfie_file_input');
  const errorDiv = document.getElementById('selfie-error');
  function handleSelfie(file) {
    renderPreview(file, 'selfie-preview');
    errorDiv.textContent = '';
    updateButtons();
  }
  takeSelfieBtn.addEventListener('click', () => cameraInput.click());
  browseFileBtn.addEventListener('click', () => fileInput.click());
  cameraInput.addEventListener('change', (e) => handleSelfie(e.target.files[0]));
  fileInput.addEventListener('change', (e) => handleSelfie(e.target.files[0]));
});

/* ---------- Ticket Upload Logic ---------- */
document.addEventListener('DOMContentLoaded', function () {
  const uploadZone = document.getElementById('ticket-upload-zone');
  const fileInput = document.getElementById('ticket_upload');
  const errorDiv = document.getElementById('ticket-error');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.querySelector('button').addEventListener('click', (e) => {
    e.stopPropagation(); fileInput.click();
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    renderPreview(file, 'ticket-preview');
    errorDiv.textContent = '';
    updateButtons();
  });
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('bg-white', 'border-primary'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('bg-white', 'border-primary'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('bg-white', 'border-primary');
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInput.files = e.dataTransfer.files;
      renderPreview(file, 'ticket-preview');
      errorDiv.textContent = '';
      updateButtons();
    }
  });
});

/* ---------- Sponsor Letter Upload Logic ---------- */
document.addEventListener('DOMContentLoaded', function () {
  const uploadZone = document.getElementById('sponsor-letter-upload-zone');
  const fileInput = document.getElementById('sponsorLetter');
  const errorDiv = document.getElementById('sponsor-letter-error');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.querySelector('button').addEventListener('click', (e) => {
    e.stopPropagation(); fileInput.click();
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    renderPreview(file, 'sponsor-letter-preview');
    errorDiv.textContent = '';
    updateButtons();
  });
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('bg-white', 'border-primary'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('bg-white', 'border-primary'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('bg-white', 'border-primary');
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInput.files = e.dataTransfer.files;
      renderPreview(file, 'sponsor-letter-preview');
      errorDiv.textContent = '';
      updateButtons();
    }
  });
});

/* ---------- Nationality Toggle ---------- */
document.addEventListener('DOMContentLoaded', function () {
  const somaliForeignRadio = document.getElementById('somali_foreign');
  const foreignerRadio = document.getElementById('foreigner');
  const nationalitySelect = document.querySelector('select[name="nationality_birth"]');
  const nationalityContainer = nationalitySelect.closest('.col-md-6');
  function toggleNationalityField() {
    if (somaliForeignRadio.checked) {
      nationalityContainer.style.display = 'none';
      nationalitySelect.classList.remove('required-input');
    } else {
      nationalityContainer.style.display = '';
      nationalitySelect.classList.add('required-input');
    }
    updateButtons();
  }
  somaliForeignRadio.addEventListener('change', toggleNationalityField);
  foreignerRadio.addEventListener('change', toggleNationalityField);
  toggleNationalityField();
});

/* ---------- Privacy Modal ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const privacyAccepted = localStorage.getItem("privacyAccepted");
  const modalEl = document.getElementById('privacyModal');
  const privacyModal = new bootstrap.Modal(modalEl);
  if (!privacyAccepted) {
    privacyModal.show();
  }
  document.getElementById("acceptPrivacy").addEventListener("click", function () {
    localStorage.setItem("privacyAccepted", "yes");
    privacyModal.hide();
  });
});

/* ---------- Disable date edits ---------- */
document.querySelectorAll('input[type="date"]').forEach(input => {
  input.addEventListener('keydown', e => e.preventDefault());
  input.addEventListener('keypress', e => e.preventDefault());
  input.addEventListener('paste', e => e.preventDefault());
  input.addEventListener('drop', e => e.preventDefault());
});

/* ---------- Init ---------- */
showStep(1);
updateButtons();
</script>
</body>
</html>