#!/bin/bash

# API Testing Script for Clean City API
# Make sure the API is running on http://localhost:3000

BASE_URL="http://localhost:3000/api"
TOKEN=""
USER_ID=""
OCCURRENCE_ID=""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Clean City API - Testing Script ===${NC}\n"

# 1. SIGNUP
echo -e "${YELLOW}1. Testing Signup...${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$SIGNUP_RESPONSE" | jq '.'

TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.token')
USER_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.user.id')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo -e "${GREEN}✓ Signup successful!${NC}\n"
else
  echo -e "${RED}✗ Signup failed!${NC}\n"
  exit 1
fi

# 2. LOGIN
echo -e "${YELLOW}2. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
if [ "$LOGIN_TOKEN" != "null" ] && [ "$LOGIN_TOKEN" != "" ]; then
  echo -e "${GREEN}✓ Login successful!${NC}\n"
  TOKEN=$LOGIN_TOKEN
else
  echo -e "${RED}✗ Login failed!${NC}\n"
fi

# 3. GET PROFILE
echo -e "${YELLOW}3. Testing Get Profile...${NC}"
curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "${GREEN}✓ Profile retrieved!${NC}\n"

# 4. CREATE OCCURRENCE
echo -e "${YELLOW}4. Testing Create Occurrence...${NC}"
CREATE_OCC=$(curl -s -X POST "$BASE_URL/occurrences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Garbage Found",
    "description": "Large amount of garbage on the street",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "address": "Avenida Paulista, São Paulo",
    "accelerometerX": 0.5,
    "accelerometerY": 0.2,
    "accelerometerZ": 9.8,
    "temperature": 25.5,
    "humidity": 65,
    "pressure": 1013
  }')

echo "$CREATE_OCC" | jq '.'
OCCURRENCE_ID=$(echo "$CREATE_OCC" | jq -r '.data.id')
echo -e "${GREEN}✓ Occurrence created! ID: $OCCURRENCE_ID${NC}\n"

# 5. GET ALL OCCURRENCES
echo -e "${YELLOW}5. Testing Get All Occurrences...${NC}"
curl -s -X GET "$BASE_URL/occurrences?page=1&limit=10" | jq '.'
echo -e "${GREEN}✓ Occurrences retrieved!${NC}\n"

# 6. GET OCCURRENCE BY ID
echo -e "${YELLOW}6. Testing Get Occurrence by ID...${NC}"
curl -s -X GET "$BASE_URL/occurrences/$OCCURRENCE_ID" | jq '.'
echo -e "${GREEN}✓ Occurrence retrieved!${NC}\n"

# 7. GET STATISTICS
echo -e "${YELLOW}7. Testing Get Statistics...${NC}"
curl -s -X GET "$BASE_URL/occurrences/stats" | jq '.'
echo -e "${GREEN}✓ Statistics retrieved!${NC}\n"

# 8. UPDATE OCCURRENCE
echo -e "${YELLOW}8. Testing Update Occurrence...${NC}"
curl -s -X PUT "$BASE_URL/occurrences/$OCCURRENCE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Garbage Report",
    "description": "Updated description"
  }' | jq '.'
echo -e "${GREEN}✓ Occurrence updated!${NC}\n"

# 9. SHARE OCCURRENCE (requires another user)
echo -e "${YELLOW}9. Testing Share Occurrence (Signup another user)...${NC}"
SIGNUP_RESPONSE2=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User 2",
    "email": "test2@example.com",
    "password": "password123"
  }')

SHARE_RESPONSE=$(curl -s -X POST "$BASE_URL/shares" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occurrenceId": "'$OCCURRENCE_ID'",
    "userEmail": "test2@example.com",
    "permission": "VIEW"
  }')

echo "$SHARE_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Occurrence shared!${NC}\n"

# 10. GET USER OCCURRENCES
echo -e "${YELLOW}10. Testing Get My Occurrences...${NC}"
curl -s -X GET "$BASE_URL/occurrences/my-occurrences?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "${GREEN}✓ My occurrences retrieved!${NC}\n"

# 11. SEARCH BY BOUNDS
echo -e "${YELLOW}11. Testing Search by Geographic Bounds...${NC}"
curl -s -X GET "$BASE_URL/occurrences/bounds?minLat=-24&maxLat=-23&minLon=-47&maxLon=-46" | jq '.'
echo -e "${GREEN}✓ Occurrences by bounds retrieved!${NC}\n"

echo -e "${YELLOW}=== All tests completed! ===${NC}\n"
