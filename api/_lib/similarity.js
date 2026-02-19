function tokenize(input) {
  if (!input) {
    return [];
  }

  return input
    .toLowerCase()
    .replace(/[^a-z0-9+\s#]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeSkill(skill) {
  return skill.trim().toLowerCase();
}

export function findMatchedAndMissingSkills(candidateSkills, requiredSkills) {
  const candidateSet = new Set(candidateSkills.map((skill) => normalizeSkill(skill)));
  const matched = [];
  const missing = [];

  for (const required of requiredSkills) {
    const requiredNormalized = normalizeSkill(required);
    const hasMatch = Array.from(candidateSet).some(
      (candidate) => candidate === requiredNormalized || candidate.includes(requiredNormalized) || requiredNormalized.includes(candidate),
    );

    if (hasMatch) {
      matched.push(required);
    } else {
      missing.push(required);
    }
  }

  return {
    matched_skills: matched,
    missing_skills: missing,
  };
}

export function overlapScore(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return 0;
  }

  const { matched_skills: matched } = findMatchedAndMissingSkills(candidateSkills, requiredSkills);
  return matched.length / requiredSkills.length;
}

function createVocabulary(documents) {
  const terms = new Set();
  for (const doc of documents) {
    for (const token of tokenize(doc)) {
      terms.add(token);
    }
  }
  return Array.from(terms);
}

function termFrequency(tokens, vocabulary) {
  if (tokens.length === 0) {
    return vocabulary.map(() => 0);
  }

  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return vocabulary.map((term) => (counts.get(term) || 0) / tokens.length);
}

function inverseDocumentFrequency(documents, vocabulary) {
  const totalDocs = documents.length;
  return vocabulary.map((term) => {
    const docsWithTerm = documents.filter((doc) => tokenize(doc).includes(term)).length;
    return Math.log((totalDocs + 1) / (docsWithTerm + 1)) + 1;
  });
}

function dot(a, b) {
  return a.reduce((total, value, index) => total + value * b[index], 0);
}

function magnitude(vector) {
  return Math.sqrt(vector.reduce((total, value) => total + value * value, 0));
}

export function cosineSimilarity(vectorA, vectorB) {
  const denominator = magnitude(vectorA) * magnitude(vectorB);
  if (!denominator) {
    return 0;
  }

  return dot(vectorA, vectorB) / denominator;
}

export function tfIdfCosineSimilarity(documentA, documentB) {
  const docs = [documentA, documentB];
  const vocabulary = createVocabulary(docs);
  if (vocabulary.length === 0) {
    return 0;
  }

  const tokensA = tokenize(documentA);
  const tokensB = tokenize(documentB);

  const tfA = termFrequency(tokensA, vocabulary);
  const tfB = termFrequency(tokensB, vocabulary);
  const idf = inverseDocumentFrequency(docs, vocabulary);

  const tfIdfA = tfA.map((value, index) => value * idf[index]);
  const tfIdfB = tfB.map((value, index) => value * idf[index]);

  return cosineSimilarity(tfIdfA, tfIdfB);
}

export function scoreJobMatch(candidateSkills, requiredSkills) {
  const overlap = overlapScore(candidateSkills, requiredSkills);
  const candidateDoc = candidateSkills.join(' ');
  const requiredDoc = requiredSkills.join(' ');
  const tfIdfScore = tfIdfCosineSimilarity(candidateDoc, requiredDoc);
  const finalScore = (overlap * 0.7 + tfIdfScore * 0.3) * 100;

  return {
    overlap_score: overlap,
    tfidf_score: tfIdfScore,
    final_score: Math.round(finalScore * 100) / 100,
  };
}

