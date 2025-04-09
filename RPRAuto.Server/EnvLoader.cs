using System.Security.Cryptography;

namespace RPRAuto.Server;

public static class EnvLoader
{
    public static RSA GetRsaPrivateKey()
    {
        string privateKeyPem = File.ReadAllText("RPRAuto.Server/private.pem");
        var rsa = RSA.Create();
        rsa.ImportFromPem(privateKeyPem);
        return rsa;
    }

    public static RSA GetRsaPublicKey()
    {
        string publicKeyPem = File.ReadAllText("RPRAuto.Server/public.pem");
        var rsa = RSA.Create();
        rsa.ImportFromPem(publicKeyPem);
        return rsa;
    }
}