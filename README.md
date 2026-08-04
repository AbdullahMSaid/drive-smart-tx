# Texas Drive Finder

Build a polished, production-ready, mobile-responsive one-page marketing website for a Texas vehicle rental business.

The primary purpose of the website is to:

Advertise the company’s economy cars and premium SUVs.

Encourage visitors to check vehicle availability.

Collect qualified rental leads through a guided form called the “Lead Qualification AI.”

Make it easy for the business owner to add more vehicles later without redesigning the page.

This is an MVP marketing and lead-generation website. It is not a complete online booking platform.

Do not build payment processing, automatic reservation confirmation, customer accounts, document uploads, real-time fleet management, or an admin dashboard at this stage.

Overall Design Direction

Create a modern, premium, trustworthy vehicle-rental website.

The design should feel:

Clean

Professional

Modern

Premium but approachable

Suitable for both affordable economy rentals and luxury SUV rentals

Optimized for mobile devices

Easy to navigate

Conversion-focused

Use:

A dark charcoal, deep navy, or near-black primary background

White or warm-white content areas

Gold, bronze, or refined amber accent colors

Large, high-quality vehicle photography

Strong typography

Generous spacing

Rounded but not overly playful cards

Subtle hover effects

Subtle scroll animations

Clear call-to-action buttons

High contrast and accessible text

Avoid:

Excessive gradients

Neon colors

Cluttered layouts

Overly futuristic AI imagery

Generic robot icons

Complicated navigation

Fake customer reviews

Fake business statistics

Fake vehicle availability

Fake contact information

Use placeholders anywhere the real business name, logo, phone number, email address, address, social media links, vehicle details, pricing, and policies have not yet been provided.

Page Navigation

Create a sticky navigation bar with:

Business logo or business name

Home

Vehicles

Premium SUVs

Promotions

FAQ

Check Availability

The “Check Availability” navigation item should be styled as the primary button.

All navigation items should smoothly scroll to the relevant section of the one-page website.

Section 1: Hero

Create a premium hero section with a large, high-quality image featuring a modern premium SUV and an economy vehicle.

Headline:

“Reliable Rentals for Everyday Drives and Premium Travel”

Supporting text:

“Choose from affordable economy vehicles and spacious premium SUVs for work, family trips, airport transportation, business travel, and special occasions.”

Primary button:

“Check Availability”

Secondary button:

“Browse Vehicles”

The “Check Availability” button should scroll directly to the Lead Qualification AI section.

The “Browse Vehicles” button should scroll to the fleet section.

Add a small trust line beneath the buttons:

“Simple rental requests. Responsive service. Vehicles for short-term and extended travel.”

Do not claim that a reservation is confirmed online.

Section 2: Rental Categories

Create a section introducing the two primary rental categories.

Economy Vehicles

Supporting copy:

“Practical, comfortable, and cost-conscious vehicles for everyday transportation, commuting, delivery work, and extended rentals.”

Include three concise benefits:

Affordable rental options

Fuel-efficient vehicles

Flexible rental inquiries

Premium SUVs

Supporting copy:

“Spacious premium SUVs designed for families, groups, airport transportation, road trips, business travel, and special occasions.”

Include three concise benefits:

Spacious passenger seating

Premium comfort

Ideal for group and long-distance travel

Each category should include a button that scrolls to its relevant fleet cards.

Section 3: Featured Fleet

Create reusable vehicle-card components generated from a central vehicle data array or configuration object.

The page architecture must allow the business owner to add another vehicle by adding one new vehicle object rather than manually redesigning the page.

Each vehicle object should support:

Vehicle name

Vehicle category

Vehicle image

Daily price

Weekly price

Minimum rental duration

Passenger capacity

Luggage capacity

Transmission

Fuel type

Key features

Availability label

Featured status

Promotional label

Vehicle description

Create placeholder inventory with four example vehicles:

Economy Vehicle 1

Name:

“Economy Sedan”

Placeholder details:

Seats: 5

Transmission: Automatic

Fuel-efficient

Daily and weekly pricing placeholders

Minimum rental period placeholder

Economy Vehicle 2

Name:

“Compact Crossover”

Placeholder details:

Seats: 5

Transmission: Automatic

Extra cargo space

Daily and weekly pricing placeholders

Minimum rental period placeholder

Premium SUV 1

Name:

“Chevrolet Suburban or Similar”

Placeholder details:

Seats: 7–8

Large luggage capacity

Premium interior

Automatic transmission

Three-day minimum rental

Daily and weekly pricing placeholders

Premium SUV 2

Name:

“Premium Full-Size SUV”

Placeholder details:

Seats: 7–8

Spacious interior

Premium comfort

Automatic transmission

Three-day minimum rental

Daily and weekly pricing placeholders

Each card should show:

Large vehicle image

Category label

Vehicle name

Short description

Passenger capacity

Transmission

Two or three important features

Pricing beginning with “Starting at”

Minimum rental period

Availability label

“Check Availability” button

The button must not automatically reserve the vehicle.

When a visitor clicks “Check Availability,” scroll to the Lead Qualification AI section and automatically preselect the chosen vehicle in the form.

Include a small disclaimer:

“Vehicle availability, pricing, eligibility, and final rental terms must be confirmed by the rental provider.”

Section 4: Premium SUV Use Cases

Create a visually engaging section specifically positioning premium SUVs and Chevrolet Suburbans for:

Family vacations

Road trips

Airport transportation

Business travel

Luxury travel

Birthday weekends

Valentine’s Day

Anniversaries

Group transportation

Special occasions

Use a clean grid of cards with tasteful travel and lifestyle imagery.

Headline:

“More Space for the Moments That Matter”

Supporting copy:

“Premium SUVs offer the comfort, space, and flexibility needed for group transportation, long-distance travel, and memorable occasions.”

Include a clear badge or message:

“Three-day minimum on premium Suburban rentals.”

Do not imply chauffeur service unless that service is later confirmed.

Section 5: How It Works

Create a four-step section.

Step 1: Browse Vehicles

“Explore economy cars and premium SUVs.”

Step 2: Check Availability

“Tell us which vehicle you need and your preferred rental dates.”

Step 3: Get Pre-Qualified

“Our Lead Qualification AI collects the basic information needed to review your request.”

Step 4: Receive a Response

“The rental team reviews your information and contacts you with availability, pricing, and next steps.”

Add a note:

“Submitting a request does not guarantee approval or confirm a reservation.”

Section 6: Why Choose Us

Create four or five trust-focused feature cards.

Use these themes:

Economy and premium options

Responsive local service

Simple rental inquiry process

Flexible rental durations

Vehicles for everyday and special-event travel

Do not invent claims about years in business, number of customers, ratings, or fleet size.

Section 7: Promotions

Create a seasonal promotions section designed so promotions can be updated from a simple data array.

Include three placeholder promotional cards:

Extended Rental Offer

“Ask about available weekly and extended-rental pricing.”

Premium SUV Getaway

“Plan a family trip, road trip, airport transfer, or special weekend with a spacious premium SUV.”

Seasonal Travel Package

“Contact us to learn about current seasonal rental offers.”

Each promotion should have a “Check Availability” button that scrolls to the Lead Qualification AI.

Do not create fake discount percentages or expiration dates.

Section 8: Lead Qualification AI

This is the primary conversion section of the website.

Position it as a guided rental assistant rather than a generic chatbot.

Section label:

“Lead Qualification AI”

Headline:

“Check Availability and Get Pre-Qualified”

Supporting copy:

“Answer a few questions about your rental needs. The Lead Qualification AI will organize your request so the rental team can quickly review your dates, vehicle preference, and basic eligibility.”

Create a modern split layout.

On one side, show a friendly AI assistant panel with:

A simple assistant icon

The label “Lead Qualification AI”

A short explanation of what it does

Three benefits:

Checks basic rental fit

Identifies missing information

Helps the rental team respond faster

On the other side, create a multi-step conversational form.

The form should feel like an AI-guided experience, but it should remain simple and reliable.

Do not require the visitor to type everything into an open-ended chatbot.

Use clear fields, buttons, dropdowns, date inputs, yes-or-no questions, and optional text areas.

Form Step 1: Contact Information

Collect:

Full name

Phone number

Email address

Preferred contact method:

Phone call

Text message

Email

Form Step 2: Rental Request

Collect:

Desired vehicle

Vehicle category:

Economy

Premium SUV

Not sure

Pickup date

Return date

Rental duration, calculated from the selected dates when possible

Rental purpose:

Everyday transportation

Work or commuting

Rideshare or delivery

Family vacation

Road trip

Airport transportation

Business travel

Birthday or celebration

Anniversary or romantic trip

Other

Pickup location or preferred service area

Additional rental notes

If a premium Suburban or premium SUV is selected, display:

“Premium Suburban rentals require a minimum rental period of three days.”

Prevent form completion when the selected premium SUV dates are fewer than three days. Clearly explain why and ask the visitor to adjust the return date.

Form Step 3: Basic Qualification

Collect:

Are you at least the minimum rental age?

Yes

No

Use a configurable placeholder for the required minimum age.

Do you have a valid driver’s license?

Yes

No

Is your driver’s license currently suspended or expired?

Yes

No

Do you currently have automobile insurance?

Yes

No

Not sure

Have you rented a vehicle before?

Yes

No

Have you had any major driving violations or serious accidents during the last three years?

Yes

No

Prefer to discuss

Are you prepared to provide a valid driver’s license and proof of insurance before final approval?

Yes

No

Are you prepared to pay the required rental deposit if approved?

Yes

No

Need pricing information

How soon do you need the vehicle?

Immediately

Within one week

Within two weeks

More than two weeks from now

Just researching

Form Step 4: Review and Consent

Show a clear summary of the visitor’s answers before submission.

Include required checkboxes:

“I understand that submitting this form does not confirm a reservation.”

“I agree to be contacted by phone, text message, or email regarding this rental request.”

“I confirm that the information I provided is accurate to the best of my knowledge.”

Include a basic privacy message:

“Do not submit Social Security numbers, payment-card details, full driver’s-license numbers, or other highly sensitive information through this form.”

Final button:

“Submit Rental Request”

Do not label the final button “Reserve Now.”

Lead Qualification Logic

After submission, create a structured lead object containing:

Submission ID

Submission timestamp

Full name

Phone

Email

Preferred contact method

Desired vehicle

Vehicle category

Pickup date

Return date

Rental duration

Rental purpose

Pickup area

Previous rental experience

Age requirement response

Valid license status

Suspended or expired license status

Insurance status

Driving history response

Document readiness

Deposit readiness

Rental urgency

Additional notes

Qualification status

Qualification score

Positive signals

Risk flags

Missing information

Recommended next action

AI-generated lead summary

Use simple deterministic qualification rules first.

The AI should support the qualification process but should not make the final rental approval decision.

Suggested statuses:

High-Priority Lead

Potential Lead — Needs Review

Missing Information

Not Currently Eligible

Suggested high-priority signals:

Meets minimum age requirement

Has a valid license

License is not suspended or expired

Has insurance

Is prepared to provide documentation

Is prepared to pay the deposit

Has complete dates

Meets the premium SUV three-day minimum when applicable

Needs the vehicle soon

Provides complete contact information

Suggested review flags:

Insurance status is uncertain

Deposit readiness requires pricing

Driving history requires discussion

Important answers are missing

The visitor is only researching

Dates are unclear

The selected vehicle is not specified

Suggested basic ineligibility signals:

Does not meet the minimum rental age

Does not have a valid driver’s license

License is suspended or expired

Refuses to provide required documentation

Premium SUV request does not meet the three-day minimum

Do not automatically reject someone solely because they have never rented before.

Do not automatically reject someone solely because they selected “Prefer to discuss” for driving history.

The final decision must remain with the business owner.

Lead Qualification Result

After successful submission, show the visitor a professional confirmation state.

Do not display a numeric lead score to the visitor.

Visitor-facing confirmation:

“Your rental request has been submitted.”

Supporting copy:

“Our Lead Qualification AI has organized your information for review. A member of the rental team will contact you regarding vehicle availability, pricing, eligibility, and next steps.”

Show:

Requested vehicle

Requested dates

Preferred contact method

Submission reference number

Provide buttons:

“Return to Vehicles”

“Submit Another Request”

Do not tell the visitor they have been approved unless a human has approved them.

Business-Owner Lead Summary

Generate an internal AI-ready summary in this format:

Lead name:
Contact information:
Requested vehicle:
Rental dates:
Rental duration:
Rental purpose:
Urgency:
License status:
Insurance status:
Document readiness:
Deposit readiness:
Previous rental experience:
Positive signals:
Risk flags:
Missing information:
Qualification status:
Recommended next action:
Concise summary:

Example concise summary:

“Potential premium SUV renter requesting a five-day Suburban rental for a family vacation. The customer reports having a valid license and insurance and is prepared to provide documentation. Deposit readiness depends on receiving final pricing. Recommended next step: confirm vehicle availability and send the deposit and rental-rate details.”

Prepare this data structure so it can later be sent to an AI model, Supabase, email automation, SMS automation, or an owner dashboard.

Form Storage and Integration Architecture

Build the form and code structure so it is ready to connect to Supabase.

Create:

A clear lead data type

Form validation

Vehicle-selection state

Rental-duration calculation

Premium SUV minimum-duration validation

Submission loading state

Success state

Error state

Placeholder service function for saving a lead

Placeholder service function for running AI lead qualification

If Supabase is already connected, create a proposed rental_leads table integration.

If Supabase is not connected, keep the application fully functional with mock submissions and clearly mark where the Supabase connection should be added.

Do not expose API keys in frontend code.

Any future AI model request must be made through a secure backend function or Supabase Edge Function, never directly from the browser.

Section 9: Frequently Asked Questions

Create an FAQ section using accordions.

Include:

Is submitting the form the same as making a reservation?

What information is required to rent a vehicle?

Is insurance required?

Is a security deposit required?

How long can I rent a vehicle?

Is there a minimum rental period for premium SUVs?

Can I use a rental for business, rideshare, or delivery work?

How will I know whether a vehicle is available?

When will someone contact me?

What documents may be required before approval?

Use careful language and placeholders where the business owner’s exact policies are not yet confirmed.

Section 10: Final Call to Action

Headline:

“Ready to Find the Right Rental?”

Supporting copy:

“Tell us what you need and when you need it. Our Lead Qualification AI will organize your request so the rental team can respond with availability and next steps.”

Button:

“Check Availability”

This button should scroll to the Lead Qualification AI form.

Footer

Include placeholders for:

Business name

Phone number

Email address

Service area

Business hours

Instagram

Facebook

Rental policy

Privacy policy

Add this disclaimer:

“Vehicle availability, eligibility, pricing, deposits, insurance requirements, and final rental terms are subject to review and confirmation. Submitting an inquiry does not create a confirmed reservation.”

Technical Requirements

Use:

React

TypeScript

Tailwind CSS

Reusable components

Clean component organization

Responsive layouts

Accessible labels

Keyboard-friendly controls

Proper loading and error states

Strong form validation

Smooth scrolling

Optimized images

Mobile-first design

Create reusable components for:

Navigation

Section headings

Vehicle cards

Category cards

Promotion cards

Feature cards

FAQ accordions

Multi-step lead form

Qualification result

Footer

Keep vehicle inventory and promotions in separate data files or configuration arrays.

Do not hardcode each vehicle directly into the page layout.

The finished site should look complete and professional with placeholder information, while making it easy to replace the placeholders with the business owner’s final branding, fleet details, pricing, contact information, photographs, policies, and service area.

Final Product Boundary

This MVP includes:

One polished landing page

Economy and premium SUV marketing sections

Reusable vehicle listings

Seasonal promotion placeholders

Lead Qualification AI section

Guided rental inquiry form

Basic qualification rules

AI-ready lead summary

Supabase-ready lead storage architecture

Mobile-responsive design

This MVP does not include:

Online payments

Instant reservation confirmation

Customer accounts

Customer document uploads

Automated document verification

Live vehicle availability synchronization

A full admin dashboard

Vehicle GPS tracking

Automated contracts

Automated approval

A general-purpose customer-service chatbot

SMS or email automation unless connected separately

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://drive-smart-tx.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d2392405-287c-4ea3-b040-84c4e3dae6b8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
