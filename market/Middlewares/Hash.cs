using System.Security.Cryptography;
using System.Text;

namespace market.Middlewares
{
    public class Hash
    {
        public static string AddHash(string pass)
        {
            byte[] temp = Encoding.UTF8.GetBytes(pass);

            using (SHA256 sha256 = SHA256.Create())
            {
                var hash = sha256.ComputeHash(temp);
                return Convert.ToBase64String(hash);
            }
        }
    }
}
