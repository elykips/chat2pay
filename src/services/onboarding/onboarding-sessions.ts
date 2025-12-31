import type { Application } from '@feathersjs/koa';
import { OnboardingSessionsService } from './onboarding-sessions.class';

export const onboardingSessions = (app: Application) => {
  app.use(
    'onboarding-sessions',
    new OnboardingSessionsService({
      Model: app.get('platformDb'),
      name: 'onboarding_sessions',
    //   paginate: app.get('paginate'),
      paginate: {
        default: 1,
        max: 1
      }
    })
  );
};
