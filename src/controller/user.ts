import { Controller, Post } from '@overnightjs/core';
import { BaseController } from '@src/controller/base';
import { User } from '@src/model/user';
import { Request, Response } from 'express';

@Controller('users')
export class UserController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const result = await user.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }
}
