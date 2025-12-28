# QR Code Business Connection Feature

## Overview
Implemented QR code scanning and PIN-based business connection features for customer app. Customers can now connect to businesses by scanning QR codes or entering 6-digit PINs.

## Features Implemented

### 1. QR Scanner Screen
**Location:** `src/screens/customer/qr/QRScannerScreen.tsx`

**Features:**
- Full-screen camera view with barcode scanning
- Custom scanning overlay with corner borders
- Camera permission handling with fallback UI
- QR code format validation: `KATHAPE_BUSINESS:<business_id>:<access_pin>`
- Automatic business connection on successful scan
- Error handling with retry/cancel options
- Loading states during connection

**Navigation:**
- Route name: `QRScanner`
- Accessible from: HomeScreen QR icon, AddBusinessModal

### 2. Add Business Modal
**Location:** `src/screens/customer/myBusinesses/AddBusinessModal.tsx`

**Features:**
- Modal with two connection options:
  1. **Scan QR Code:** Opens QR scanner camera
  2. **Enter PIN:** 6-digit numeric input field
- PIN validation (must be exactly 6 digits)
- Loading states during API calls
- Success/error alerts with callbacks
- Auto-refresh business list on success

**Usage:**
```typescript
<AddBusinessModal
  visible={showAddModal}
  onClose={() => setShowAddModal(false)}
  onSuccess={() => {
    setShowAddModal(false);
    loadMyBusinesses();
  }}
  navigation={navigation}
/>
```

### 3. HomeScreen QR Icon
**Location:** `src/screens/customer/home/HomeScreen.tsx`

**Changes:**
- Added QR code icon button in header (next to profile icon)
- Navigates directly to QR scanner screen
- Icon: `qr-code-outline` from Ionicons

### 4. My Businesses Add Button
**Location:** `src/screens/customer/myBusinesses/MyBusinessesScreen.tsx`

**Changes:**
- Added circular "+" button in header
- Opens AddBusinessModal when clicked
- Positioned next to "My Businesses" title
- Refreshes business list after successful connection

### 5. API Integration
**Location:** `src/services/api.ts`

**New Method:**
```typescript
async connectBusiness(accessPin: string): Promise<any> {
  const response = await this.api.post('/api/business/connect', {
    access_pin: accessPin,
  });
  return response.data;
}
```

**Backend Endpoint:**
- URL: `POST /api/business/connect`
- Payload: `{ access_pin: string }`
- Response: `{ message: string, business: { id, name } }`

## QR Code Format

### Business App QR Generation
Business app generates QR codes with format:
```
KATHAPE_BUSINESS:<business_id>:<access_pin>
```

**Example:**
```
KATHAPE_BUSINESS:65f3c8e1a2b4c5d6e7f8g9h0:123456
```

### Customer App QR Parsing
1. Scans QR code
2. Validates format starts with `KATHAPE_BUSINESS:`
3. Splits by `:` delimiter
4. Extracts parts:
   - `parts[0]`: "KATHAPE_BUSINESS" (identifier)
   - `parts[1]`: business_id
   - `parts[2]`: access_pin (6 digits)
5. Uses `access_pin` to call connect API

## Navigation Structure

```
App.tsx
├── Main (CustomerTabNavigator)
│   ├── Home (HomeScreen)
│   │   └── QR Icon → QRScanner
│   └── My Businesses (MyBusinessesScreen)
│       └── Add Button → AddBusinessModal
│           └── Scan QR → QRScanner
└── QRScanner (QRScannerScreen)
    └── Success → Navigate back
```

## User Flow

### Flow 1: QR Code from Homepage
1. User taps QR icon in home header
2. Opens camera scanner with overlay
3. User scans business QR code
4. App validates format and extracts PIN
5. Connects to business via API
6. Shows success alert
7. Navigates back to home

### Flow 2: Add Business with QR
1. User opens My Businesses screen
2. Taps "+" Add button
3. Modal shows with two options
4. Selects "Scan QR Code"
5. Opens camera scanner
6. Scans business QR code
7. Connects and refreshes business list
8. Modal closes automatically

### Flow 3: Add Business with PIN
1. User opens My Businesses screen
2. Taps "+" Add button
3. Modal shows with two options
4. Selects "Enter PIN"
5. Types 6-digit PIN
6. Taps "Connect" button
7. Connects via API
8. Shows success and refreshes list
9. Modal closes automatically

## Camera Permissions

### iOS (app.json or Info.plist)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to scan QR codes for connecting to businesses."
      }
    }
  }
}
```

### Android (app.json)
```json
{
  "expo": {
    "android": {
      "permissions": ["CAMERA"]
    }
  }
}
```

## Testing Checklist

### Camera Permissions
- [ ] First launch requests camera permission
- [ ] Denying permission shows fallback UI with message
- [ ] Granting permission shows camera view
- [ ] "Go to Settings" button works (iOS/Android)

### QR Scanning
- [ ] Camera focuses correctly
- [ ] Overlay corners visible
- [ ] Scans Business app QR code successfully
- [ ] Invalid QR format shows error
- [ ] Valid scan connects business
- [ ] Success alert appears
- [ ] Navigates back after success

### PIN Entry
- [ ] Modal opens from Add button
- [ ] Can type 6 digits
- [ ] Cannot type more than 6 digits
- [ ] Cannot type non-numeric characters
- [ ] Connect button disabled until 6 digits
- [ ] Valid PIN connects successfully
- [ ] Invalid PIN shows error
- [ ] Modal closes on success

### Business List
- [ ] Business appears in list after connection
- [ ] Balance shows correctly
- [ ] Can tap to view details
- [ ] Transaction history accessible

### Edge Cases
- [ ] Already connected business shows error
- [ ] Network error handled gracefully
- [ ] Loading states prevent double-submit
- [ ] Can cancel QR scan
- [ ] Can close modal without connecting

## Dependencies

```json
{
  "expo-camera": "~15.0.10",
  "@react-navigation/native": "^6.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "react-native-vector-icons": "^10.x"
}
```

## Backend Requirements

### Customer Backend
- Endpoint: `POST /api/business/connect`
- Accepts: `{ access_pin: string }`
- Logic:
  1. Find business by access_pin
  2. Check if customer already connected
  3. Create customer_credit relationship
  4. Return success with business details

### Business Backend
- Endpoint: `GET /api/business/qr-code`
- Generates QR with format: `KATHAPE_BUSINESS:<id>:<pin>`
- Returns PNG image

## Design Details

### QR Scanner
- **Background:** Camera feed full screen
- **Overlay:** Semi-transparent dark (#000000, 60% opacity)
- **Scanning Frame:** 300x300 center area
- **Corners:** White rounded borders (20px, 4px thickness)
- **Icon:** White QR code icon below frame
- **Text:** Instructions below icon

### Add Business Modal
- **Animation:** Slide up from bottom
- **Background:** Theme background with border radius
- **Cards:** Two large touchable cards
  - QR option: Purple gradient with QR icon
  - PIN option: Green gradient with keypad icon
- **PIN Input:** 
  - Centered, large text (24px)
  - Letter-spaced (8px)
  - Placeholder: "Enter 6-digit PIN"
- **Button:** Full width, rounded, gradient

### My Businesses Header
- **Layout:** Row with space-between
- **Add Button:** 
  - Circular (40x40)
  - Primary color background
  - White "+" icon (24px)
  - Shadow for elevation

## Error Handling

### QR Scanner Errors
- **Invalid Format:** "Invalid QR code format"
- **Network Error:** "Connection failed. Please try again."
- **Already Connected:** "You are already connected to this business"

### PIN Entry Errors
- **Invalid PIN:** "Invalid PIN. Please check and try again."
- **Network Error:** "Connection failed. Please check your internet."
- **Already Connected:** "You are already connected to this business"

### Camera Errors
- **Permission Denied:** Shows fallback UI with settings link
- **Camera Unavailable:** "Camera not available on this device"

## Future Enhancements

1. **QR History:** Save scanned QR codes for quick re-connect
2. **Bulk Connect:** Scan multiple QR codes in sequence
3. **NFC Support:** Connect via NFC tap (iOS/Android)
4. **Share PIN:** Copy PIN to clipboard for manual entry
5. **Business Search:** Search by business name instead of PIN
6. **Nearby Businesses:** Use location to find nearby businesses
7. **QR Analytics:** Track scan success rate and errors

## Troubleshooting

### Camera Not Working
- Ensure expo-camera is installed: `npx expo install expo-camera`
- Check permissions in app.json
- Rebuild app after adding permissions
- Test on physical device (camera may not work in simulator)

### QR Not Scanning
- Ensure QR code has correct format
- Check camera focus and lighting
- Verify barcode types include 'qr' in CameraView
- Test with different QR sizes

### Connection Failing
- Verify backend endpoint is accessible
- Check network connectivity
- Ensure access_pin is valid
- Check backend logs for errors

## Files Modified

1. **NEW:** `src/screens/customer/qr/QRScannerScreen.tsx`
2. **NEW:** `src/screens/customer/myBusinesses/AddBusinessModal.tsx`
3. **Modified:** `src/services/api.ts` (added connectBusiness method)
4. **Modified:** `src/screens/customer/home/HomeScreen.tsx` (added QR icon)
5. **Modified:** `src/screens/customer/myBusinesses/MyBusinessesScreen.tsx` (added Add button and modal)
6. **Modified:** `App.tsx` (registered QRScanner route)

## Commit Message
```
feat: Add QR code scanning and PIN-based business connection

- Implement QRScannerScreen with camera and QR validation
- Add AddBusinessModal with PIN/QR options
- Integrate QR icon in HomeScreen header
- Add "Add Business" button in MyBusinessesScreen
- Create API method for business connection
- Register QRScanner navigation route
- Install expo-camera dependency

Customers can now connect to businesses by:
1. Scanning QR codes from homepage or My Businesses
2. Entering 6-digit PINs manually

QR Format: KATHAPE_BUSINESS:<business_id>:<access_pin>
```
