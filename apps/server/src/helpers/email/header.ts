import env from '../../env/env';
import renderHtml from './renderHtml';

export default () => {
  return (renderHtml`${env.STAGE !== 'prod' ? renderHtml`<!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#F2CA1A" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
  <div style="background:#F2CA1A;background-color:#F2CA1A;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#F2CA1A;background-color:#F2CA1A;width:100%;">
      <tbody>
        <tr>
          <td style="direction:ltr;font-size:0px;padding:12px 30px;text-align:center;">
            <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
            <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tbody>
                  <tr>
                    <td style="vertical-align:top;padding:0;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                        <tbody>
                          <tr>
                            <td align="left" style="font-size:0px;padding:8px;word-break:break-word;">
                              <div style="font-family:'Helvetica', 'Arial', sans-serif;font-size:18px;line-height:1.375;text-align:left;color:#000000;">Warning: This email was sent from a non-prod environment</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!--[if mso | IE]></td></tr></table><![endif]-->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!--[if mso | IE]></td></tr></table><![endif]-->` : ''}`);
};
