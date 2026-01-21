
const EXERCISE_API_CONFIG = {
  baseUrl: 'https://exercisedb.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': '2c42488e90mshe407ab8708feb2ap100530jsn17f62f51deee',
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    'Accept': 'application/json'
  }
};

async function handleResponse(response: Response, context: string) {
  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = JSON.stringify(errorJson);
    } catch (e) {
      errorDetail = await response.text();
    }
    console.error(`ExerciseDB API Error (${context}): ${response.status} ${response.statusText}`, errorDetail);
    throw new Error(`Search failed: ${response.status}`);
  }
  return await response.json();
}

export async function searchExercisesFromWeb(query: string) {
  try {
    const response = await fetch(
      `${EXERCISE_API_CONFIG.baseUrl}/exercises/name/${encodeURIComponent(query.toLowerCase())}?limit=30`,
      { headers: EXERCISE_API_CONFIG.headers }
    );
    return await handleResponse(response, 'Name Search');
  } catch (error) {
    console.error('Exercise search error:', error);
    return [];
  }
}

export async function getExercisesByBodyPart(bodyPart: string) {
  try {
    const response = await fetch(
      `${EXERCISE_API_CONFIG.baseUrl}/exercises/bodyPart/${encodeURIComponent(bodyPart.toLowerCase())}?limit=50`,
      { headers: EXERCISE_API_CONFIG.headers }
    );
    return await handleResponse(response, 'Body Part Filter');
  } catch (error) {
    console.error('Body part fetch error:', error);
    return [];
  }
}
