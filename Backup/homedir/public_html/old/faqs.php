<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Frequently Asked Questions</title>
  <link rel="icon" type="image/png" href="img/somalia_fav.jpg">
  <!-- Bootstrap 5.3 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <!-- Inter Font -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">
</head>
<body>
<?php 
$page = 'faqs';
include 'header.php';
?>

<section class="hero-about text-center py-8 text-white">
  <div class="container py-5">
    <h2 class="display-4 fw-bold"  style="font-size:2.8em">Frequently Asked Questions</h2>
  </div>
</section>

  <!-- About -->
<section id="learn" class="py-5 bg-light">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-12">
        <h1 class="text-center">Frequently Asked Questions</h1><br>
        <div class="accordion" id="faqAccordion">

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                1. What is the eTAS?
              </button>
            </h2>
            <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                The eTAS is an official electronic travel authorization that foreign travelers must obtain before entry. It replaces traditional visas for most travelers and simplifies the entry process by allowing fully online applications.<br><br>
                With an approved eTAS, travelers can visit the destination for tourism, business, or transit purposes — without visiting an embassy or consulate. The eTAS offers a faster, simpler, and more convenient travel experience.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                2. I have a diplomatic passport. Do I have to apply for an eTAS?
              </button>
            </h2>
            <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Holders of diplomatic, service, or ordinary passports from certain countries are granted visa-free entry or are eligible for travel authorizations on arrival. However, for official duties, diplomats must obtain a diplomatic travel authorization prior to entry. Check the official exemptions list on etas.gov.so for your nationality.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                3. Do I need to pay for my eTAS as a diplomat?
              </button>
            </h2>
            <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                If you are exempt from the eTAS requirement as a diplomat or from a travel-authorization-free country, no fee is required. For others, the eTAS application fee must be paid to initiate processing. The exact fee amount is available on the official portal.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                4. We are traveling as a couple or group. Is one eTAS enough for all of us?
              </button>
            </h2>
            <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                No. Each traveler, including infants and children, must obtain an individual eTAS. You can apply for multiple individuals separately on the portal, but each requires their own submission and payment.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                5. How do I apply for the eTAS?
              </button>
            </h2>
            <div id="faq5" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Applying for an eTAS is quick and completely online:<br>
                <ul>
                  <li>Visit the Application Portal – Start your application on etas.gov.so.</li>
                  <li>Complete the Application Form – Enter your personal details, passport information, and travel plans.</li>
                  <li>Upload Required Documents – Attach your passport copy, photo, and other supporting documents.</li>
                  <li>Pay the Required Fees – Submit the service fee via credit card or other accepted options.</li>
                  <li>Submit Your Application – Review your details carefully before submission.</li>
                  <li>Receive Your eTAS – Once approved, your travel authorization will be sent directly to your email. You may print or save it digitally for travel.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq6">
                6. What documents are required for an eTAS application?
              </button>
            </h2>
            <div id="faq6" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Typical requirements include:<br>
                <ul>
                  <li>Valid passport (minimum 6 months validity with at least one blank page)</li>
                  <li>Passport-style photograph or selfie</li>
                  <li>Contact details (email address & phone number)</li>
                  <li>Travel itinerary (arrival and departure details)</li>
                  <li>Accommodation booking confirmation</li>
                  <li>Payment method (credit/debit card or other accepted options)</li>
                </ul>
                Note: Additional documents may be requested depending on the travel purpose.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq7">
                7. How long does it take to process an eTAS?
              </button>
            </h2>
            <div id="faq7" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Processing times may vary, but most applications are reviewed within a few days. Apply well in advance of your travel date. In rare cases, technical issues or additional verification may extend the time.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq8">
                8. How can I track my eTAS application?
              </button>
            </h2>
            <div id="faq8" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                You can easily track your eTAS status by visiting the "Track Application" page on etas.gov.so and entering your reference number received via email after submitting your application. The Immigration Authority does not send notifications, so check regularly.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq9">
                9. Can someone apply on behalf of another traveler?
              </button>
            </h2>
            <div id="faq9" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Yes. An applicant can apply on behalf of another traveler, provided all information and documents are correctly submitted. Indicate that you are applying on someone else’s behalf during the submission process.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq10">
                10. What should I do if I made a mistake in my eTAS application?
              </button>
            </h2>
            <div id="faq10" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Prior to submission, you can correct all data fields. If you notice an error after submitting, contact support at support@evisa.gov.so immediately with the correct details. Once submitted, corrections may not be possible, and a new application might be required, incurring additional fees.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq11">
                11. Is my eTAS service fee refundable if my application is rejected?
              </button>
            </h2>
            <div id="faq11" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                No. The eTAS service fee is non-refundable, regardless of the final outcome, as it covers administrative and processing costs. In very rare cases where the application is declined at the discretion of the Immigration Authority, a refund may be considered.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</section>
<?php include 'footer.php';?>
    <script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>