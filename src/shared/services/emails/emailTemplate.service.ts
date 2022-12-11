import fs from 'fs';
import ejs from 'ejs';
import { injectable } from 'inversify';
import { ResetPassword } from '@user/interfaces/user.interface';

export interface EmailTemplateService {
  getForgotPassword(username: string, resetLink: string): string;
  getResetPasswordConfirmation({ username, email, ipaddress, date }: ResetPassword): string;
}

// TODO: Update image url to winter logo
@injectable()
export default class EmailTemplateServiceImpl implements EmailTemplateService {
  getForgotPassword(username: string, resetLink: string): string {
    const file = fs.readFileSync(__dirname + '/templates/forgotPassword.template.ejs', 'utf8');
    return ejs.render(file, {
      username,
      resetLink,
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi14Ly49zGCd_iHFdRVd_VQzggrxwvMrnxjw&usqp=CAU'
    });
  }
  getResetPasswordConfirmation({ username, email, ipaddress, date }: ResetPassword): string {
    const file = fs.readFileSync(__dirname + '/templates/resetPassword.template.ejs', 'utf8');
    return ejs.render(file, {
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi14Ly49zGCd_iHFdRVd_VQzggrxwvMrnxjw&usqp=CAU'
    });
  }
}
