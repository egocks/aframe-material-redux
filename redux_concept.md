# Aframe Material Redux

## Updates

- Make it work with the latest Aframe version
- Use the latest dependencies
- Fix security issues

## Enhancements

### a-input
- toggle features on/off
  - clear/reset button (useful for search)
  - secret (useful for password)
- Format mask
  - Phone number
  - General mask definition. Useful for:
    - Social Security Number (SSN)
    - Credit card number with auto-formatting
    - Postal/ZIP code
    - International phone with country code
    - Currency/monetary values
    - IBAN/account numbers

### a-radio
- styles
  - Ordinary radio button
  - Image selector - choose from image thumbnails
  - Icon selector / cassette buttons

## New Fields

### Multi-line Text

- a-textarea - expandable text area for longer content
- a-rich - formatted text with styling controls
- a-markdown - plain text with markdown preview
- a-code - with syntax highlighting

### Numeric Input Fields

- a-spinner - with increment/decrement spinners
  - configuration:
    - min
    - max
    - step
    - precision
    - scientific notation
    - direction (vertical/horizontal)
- a-slider - range slider
  - configuration:
    - min
    - max
    - step_major
    - step_minor

### Date/Time

- a-date - date picker
- a-time - time picker
  - configuration:
    - format (12-hour/24-hour)
- a-datetime - datetime picker

### Dropdown Select
- Dropdown/Select menu - compact list selection
- Autocomplete dropdown - type-to-filter
- Combobox - editable dropdown

## New Features

### a-input
- Email validation
- URL validation
- Username availability check API (hooks only, no implementation)


Multiple Selection

Checkboxes - independent selections
Multi-select dropdown - multiple options from list
Tag/token input - searchable multi-select chips
Transfer list - move items between two lists
Dual listbox
Button group (multi-select)

File & Media Inputs
File Upload

Single file upload
Multiple file upload
Drag-and-drop file zone
File upload with preview
Image upload with crop/resize
Document scanner integration
Cloud storage picker (Google Drive, Dropbox, etc.)

Media Capture

Camera capture (photo)
Video recorder
Audio recorder
Screen capture
Signature pad - stylus/touch drawing
Canvas drawing field

Specialized Input Types
Identity & Security

Biometric input (fingerprint, face ID)
Two-factor authentication (2FA) code
CAPTCHA/reCAPTCHA
One-time password (OTP) input
PIN code input (segmented boxes)
Security question selector

Location & Geography

Address autocomplete
Full address form (street, city, state, zip)
Map picker - select location on map
Coordinates input (latitude/longitude)
Geolocation button (use current location)
Country selector
State/Province selector
City selector (dependent on country/state)

Color & Design

Color picker (hex, RGB, HSL)
Gradient picker
Palette selector
Theme selector

Rating & Feedback

Star rating (1-5 or custom scale)
Emoji rating
Thumbs up/down
NPS score (0-10 scale)
Likert scale (strongly disagree to strongly agree)
Slider rating (continuous scale)
Matrix rating grid

Advanced/Composite Fields
Relationship Fields

Lookup/reference field - links to other records
Relation picker - connects related entities
Hierarchical selector - tree structure navigation
Tag taxonomy selector
Dependency dropdown - cascading selections

Dynamic Fields

Conditional fields - appear based on other inputs
Repeater field - add/remove field groups
Array builder - dynamic list management
Key-value pair editor
JSON editor
Query builder - visual database query construction

Structured Data

Name field (first, middle, last, suffix)
Credit card form (number, CVV, expiry)
Bank account details
Contact information composite
Social media handles group

Specialized Domain Fields
E-commerce

Size selector (S, M, L, XL or numeric)
Quantity with inventory display
Variant selector (color, size, style)
Gift message field
Coupon/promo code input
Wishlist selector

Scheduling/Booking

Availability calendar
Time slot selector
Appointment picker
Booking duration selector
Recurring schedule builder

Content/Media

Embed URL input (YouTube, Vimeo, etc.)
Mention/tag user input (@ mentions)
Hashtag input
Emoji picker
GIF selector
Sticker selector

Financial

Payment method selector
Card type detector
ACH/direct debit form
Cryptocurrency wallet address
Stock ticker input

Health/Medical

Blood type selector
Height/weight inputs
Body measurement inputs
Medical history checklist
Medication dosage input
Symptom checker

Educational

Multiple choice question
True/false toggle
Fill-in-the-blank
Matching pairs
Ordering/ranking items
Essay response area

Accessibility-Enhanced Fields

Voice input (speech-to-text)
Switch control input
High-contrast mode compatible fields
Screen reader optimized inputs
Keyboard-only navigation fields

Emerging/Modern Types (2024-2025)

AI-assisted autocomplete with LLM suggestions
Smart forms with predictive field population
Blockchain wallet connectors
NFT selector
Spatial computing inputs (AR/VR pointer fields)
Gesture-based inputs
Eye-tracking selection fields
Brain-computer interface inputs (experimental)
Conversational form fields (chatbot-style input)
Voice-only form completion

Hidden/Technical Fields

Hidden input - not visible but submitted with form
Honeypot field - spam prevention
CSRF token field
Session ID field
Tracking/analytics fields
UTM parameter fields