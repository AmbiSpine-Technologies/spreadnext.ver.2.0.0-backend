/**
 * Unit Tests for Job Application Service
 * Run: npm test
 */

// Note: calculateMatchScore is not exported, it's used internally
// This test file demonstrates the testing setup
// For actual testing, you would need to export the function or test through the service

describe('Job Application Service', () => {
  test('test setup is working', () => {
    expect(true).toBe(true);
  });

  // TODO: When calculateMatchScore is exported or made testable:
  // test('should calculate match score based on skills, experience, and role', () => {
  //   const profile = {
  //     skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
  //     workExperience: [{ years: 2 }],
  //     recentExperience: {
  //       experienceYears: 3,
  //       jobTitle: 'Frontend Developer'
  //     },
  //     personalInfo: {
  //       headline: 'Senior Frontend Developer'
  //     }
  //   };
  //
  //   const job = {
  //     title: 'Frontend Developer',
  //     skills: ['React', 'JavaScript', 'Next.js'],
  //     experience: 2
  //   };
  //
  //   const score = calculateMatchScore(profile, job);
  //   expect(score).toBeGreaterThanOrEqual(10);
  //   expect(score).toBeLessThanOrEqual(98);
  // });
});
