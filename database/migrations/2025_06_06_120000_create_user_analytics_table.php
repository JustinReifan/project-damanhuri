
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_analytics', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->index();
            $table->string('event_type'); // visit, scroll, engagement, conversion, payment
            $table->json('event_data'); // flexible data storage
            $table->string('referral_source')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('ip_hash')->nullable(); // anonymized IP
            $table->string('user_agent')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamp('created_at');
            $table->index(['event_type', 'created_at']);
            $table->index(['referral_source', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_analytics');
    }
};
