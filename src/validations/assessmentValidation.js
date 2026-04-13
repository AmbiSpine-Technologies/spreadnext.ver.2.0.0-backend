import Joi from 'joi';

export const startAssessmentSchema = Joi.object({
  jobId: Joi.string().required()
});

export const submitAssessmentSchema = Joi.object({
  assessmentId: Joi.string().required(),
  answers: Joi.array()
    .min(1)
    .items(
      Joi.object({
        questionId: Joi.number().required(),
        selectedAnswer: Joi.number().min(0).max(3).required()
      })
    )
});
