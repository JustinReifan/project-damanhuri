<?php

use App\Services\MetaConversionService;
use Illuminate\Http\Request;

beforeEach(function () {
    config([
        'services.meta.pixel_id' => 'test_pixel_123',
        'services.meta.access_token' => 'test_token_abc',
    ]);
});

it('reports as configured when both pixel_id and access_token are set', function () {
    $service = new MetaConversionService;

    expect($service->isConfigured())->toBeTrue();
});

it('reports as not configured when pixel_id is missing', function () {
    config(['services.meta.pixel_id' => '']);

    $service = new MetaConversionService;

    expect($service->isConfigured())->toBeFalse();
});

it('reports as not configured when access_token is missing', function () {
    config(['services.meta.access_token' => '']);

    $service = new MetaConversionService;

    expect($service->isConfigured())->toBeFalse();
});

it('does not throw when sending PageView without real credentials', function () {
    // With fake credentials, the SDK call will fail gracefully
    $service = new MetaConversionService;
    $request = Request::create('/', 'POST', [
        'event_data' => ['page' => '/'],
    ]);
    $request->headers->set('User-Agent', 'PHPUnit Test');

    // Should not throw — errors are caught and logged
    $service->sendPageView($request, 'test-event-id-123');

    expect(true)->toBeTrue();
});

it('does not throw when sending AddToCart without real credentials', function () {
    $service = new MetaConversionService;
    $request = Request::create('/', 'POST', [
        'event_data' => [
            '_fbp' => 'fb.1.123456789.987654321',
            '_fbc' => 'fb.1.123456789.AbCdEfGh',
        ],
    ]);
    $request->headers->set('User-Agent', 'PHPUnit Test');

    $service->sendAddToCart($request, 'test-event-id-456');

    expect(true)->toBeTrue();
});

it('skips sending when not configured', function () {
    config([
        'services.meta.pixel_id' => '',
        'services.meta.access_token' => '',
    ]);

    $service = new MetaConversionService;
    $request = Request::create('/', 'POST');
    $request->headers->set('User-Agent', 'PHPUnit Test');

    // Should return silently without attempting API call
    $service->sendPageView($request, 'test-event-id');
    $service->sendAddToCart($request, 'test-event-id');

    expect(true)->toBeTrue();
});
