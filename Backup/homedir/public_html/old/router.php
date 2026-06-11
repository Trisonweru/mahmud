<?php
$routes = [
    'about'              => 'about.php',
    'application'        => 'application.php',
    'contact'            => 'contact.php',
    'documents'          => 'documents.php',
    'faqs'               => 'faqs.php',
    'instructions'       => 'instructions.php',
    'services'           => 'services.php',
    'application_status' => 'status.php',
    'privacy'            => 'privacy.php',
    'terms'              => 'terms.php',
    'refund_policy'      => 'refund_policy.php',
    'formassist'         => 'formassist.php',
];

$path = ltrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

if (isset($routes[$path])) {
    require __DIR__ . '/' . $routes[$path];
    return true;
}

// Serve static files directly (images, css, js, etc.)
if ($path !== '' && file_exists(__DIR__ . '/' . $path)) {
    return false;
}

// Fallback: serve index
require __DIR__ . '/index.php';
