import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

async function verifyHierarchy() {
    try {
        console.log('Testing /categories/hierarchy...');
        const res = await axios.get(`${BASE_URL}/categories/hierarchy`);
        if (res.status === 200 && res.data.success) {
            console.log('✅ Hierarchy API passed');
        } else {
            console.error('❌ Hierarchy API failed:', res.status, res.data);
        }
    } catch (error: any) {
        console.error('❌ Hierarchy API error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

async function verifySections() {
    try {
        console.log('Testing /sections?page=homepage...');
        const res = await axios.get(`${BASE_URL}/sections?page=homepage`);
        if (res.status === 200 && res.data.success) {
            console.log('✅ Sections API passed');
        } else {
            console.error('❌ Sections API failed:', res.status, res.data);
        }
    } catch (error: any) {
        console.error('❌ Sections API error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

async function main() {
    await verifyHierarchy();
    await verifySections();
}

main();
