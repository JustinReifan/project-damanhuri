<?php

namespace App\Services;

use FacebookAds\Api;
use FacebookAds\Object\ServerSide\ActionSource;
use FacebookAds\Object\ServerSide\Content;
use FacebookAds\Object\ServerSide\CustomData;
use FacebookAds\Object\ServerSide\Event;
use FacebookAds\Object\ServerSide\EventRequest;
use FacebookAds\Object\ServerSide\UserData;
use Illuminate\Http\Request;
use Log;

class MetaConversionService
{
    private string $pixelId;

    private string $accessToken;

    public function __construct()
    {
        $this->pixelId = config('services.meta.pixel_id', '');
        $this->accessToken = config('services.meta.access_token', '');

        if ($this->isConfigured()) {
            Api::init(null, null, $this->accessToken, false);
        }
    }

    /**
     * Check if CAPI is properly configured.
     */
    public function isConfigured(): bool
    {
        return $this->pixelId !== '' && $this->accessToken !== '';
    }

    /**
     * Send a PageView event to Meta Conversions API.
     */
    public function sendPageView(Request $request, string $eventId): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        $userData = $this->buildUserData($request);

        $event = (new Event)
            ->setEventName('PageView')
            ->setEventTime(time())
            ->setEventId($eventId)
            ->setEventSourceUrl($request->header('Referer', $request->url()))
            ->setActionSource(ActionSource::WEBSITE)
            ->setUserData($userData);

        $this->sendEvents([$event]);
    }

    /**
     * Send an AddToCart event to Meta Conversions API.
     */
    public function sendAddToCart(Request $request, string $eventId): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        $userData = $this->buildUserData($request);

        $content = (new Content)
            ->setProductId('panduan-23-langkah')
            ->setQuantity(1);

        $customData = (new CustomData)
            ->setContentName('Panduan 23 Langkah Bangun Bisnis Lokal')
            ->setContentType('product')
            ->setValue(97000)
            ->setCurrency('IDR')
            ->setContents([$content]);

        $event = (new Event)
            ->setEventName('AddToCart')
            ->setEventTime(time())
            ->setEventId($eventId)
            ->setEventSourceUrl($request->header('Referer', $request->url()))
            ->setActionSource(ActionSource::WEBSITE)
            ->setUserData($userData)
            ->setCustomData($customData);

        $this->sendEvents([$event]);
    }

    /**
     * Build UserData from the HTTP request with browser cookie matching.
     */
    private function buildUserData(Request $request): UserData
    {
        $userData = (new UserData)
            ->setClientIpAddress($request->ip())
            ->setClientUserAgent($request->userAgent());

        // Set _fbp cookie for browser matching
        $fbp = $request->input('event_data._fbp') ?? $request->cookie('_fbp');
        if ($fbp) {
            $userData->setFbp($fbp);
        }

        // Set _fbc cookie for click ID matching
        $fbc = $request->input('event_data._fbc') ?? $request->cookie('_fbc');
        if ($fbc) {
            $userData->setFbc($fbc);
        }

        return $userData;
    }

    /**
     * Send events to Meta Conversions API.
     *
     * @param  array<Event>  $events
     */
    private function sendEvents(array $events): void
    {
        try {
            $eventRequest = (new EventRequest($this->pixelId))
                ->setEvents($events);

            $response = $eventRequest->execute();

            Log::debug('Meta CAPI response', [
                'events_received' => $response->getEventsReceived(),
                'messages' => $response->getMessages(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Meta CAPI request failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
