import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/auth.guard';
import { User } from './users/user';
import { ExecutionContext } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn().mockResolvedValue('validUser'),
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({
        canActivate: jest.fn((context: ExecutionContext) => {
          return true;
        }),
      })
      .compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('login', () => {
    it('should validate user and return the result', async () => {
      const user = { name: 'test', email: 'test@test.com' } as User;
      const result = await appController.login(user);
      expect(authService.validateUser).toHaveBeenCalledWith(
        user.name,
        user.email,
      );
      expect(result).toBe('validUser');
    });
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
