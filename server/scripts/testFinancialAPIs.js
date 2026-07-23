require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data.data.token;
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function testFinancialAPIs() {
  console.log('=== Testing Phase 3 Financial Features APIs ===\n');

  const token = await login('admin@simtechinstitute.edu', 'ChangeMe123!');
  if (!token) {
    console.log('✗ Login failed - cannot continue testing');
    return;
  }

  console.log('✓ Login successful\n');

  // Test Fee Categories
  console.log('--- Testing Fee Categories ---');
  try {
    const response = await axios.get(`${API_URL}/fees/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /fees/categories: ${response.data.data.length} categories`);
  } catch (error) {
    console.log(`✗ GET /fees/categories: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  // Test Tuition Structures
  console.log('\n--- Testing Tuition Structures ---');
  try {
    const response = await axios.get(`${API_URL}/fees/tuition-structures`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /fees/tuition-structures: ${response.data.data.length} structures`);
  } catch (error) {
    console.log(`✗ GET /fees/tuition-structures: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  // Test Class Fees
  console.log('\n--- Testing Class Fees ---');
  try {
    const response = await axios.get(`${API_URL}/fees/class-fees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /fees/class-fees: ${response.data.data.length} fees`);
  } catch (error) {
    console.log(`✗ GET /fees/class-fees: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  // Test Discounts
  console.log('\n--- Testing Discounts ---');
  try {
    const response = await axios.get(`${API_URL}/fees/discounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /fees/discounts: ${response.data.data.length} discounts`);
  } catch (error) {
    console.log(`✗ GET /fees/discounts: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  // Test Scholarships
  console.log('\n--- Testing Scholarships ---');
  try {
    const response = await axios.get(`${API_URL}/fees/scholarships`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /fees/scholarships: ${response.data.data.length} scholarships`);
  } catch (error) {
    console.log(`✗ GET /fees/scholarships: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  // Test Invoices
  console.log('\n--- Testing Invoices ---');
  try {
    const response = await axios.get(`${API_URL}/invoices`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /invoices: ${response.data.data.length} invoices`);
  } catch (error) {
    console.log(`✗ GET /invoices: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  // Test Payments
  console.log('\n--- Testing Payments ---');
  try {
    const response = await axios.get(`${API_URL}/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /payments: ${response.data.data.length} payments`);
  } catch (error) {
    console.log(`✗ GET /payments: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  // Test Financial Reports
  console.log('\n--- Testing Financial Reports ---');
  
  try {
    const response = await axios.get(`${API_URL}/reports/financial-summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /reports/financial-summary: Total billed ${response.data.data.total_billed}, Collected ${response.data.data.total_collected}`);
  } catch (error) {
    console.log(`✗ GET /reports/financial-summary: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  try {
    const response = await axios.get(`${API_URL}/reports/student-balances`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /reports/student-balances: ${response.data.data.length} students`);
  } catch (error) {
    console.log(`✗ GET /reports/student-balances: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  try {
    const response = await axios.get(`${API_URL}/reports/outstanding-fees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ GET /reports/outstanding-fees: ${response.data.data.length} fee types`);
  } catch (error) {
    console.log(`✗ GET /reports/outstanding-fees: ${error.response?.status} - ${error.response?.data?.error}`);
  }

  console.log('\n=== Financial API Testing Complete ===');
}

testFinancialAPIs();
