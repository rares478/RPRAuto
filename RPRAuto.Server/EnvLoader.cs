using System.Security.Cryptography;

namespace RPRAuto.Server;

public static class EnvLoader
{
    public static RSA GetRsaPrivateKey()
    {
        string privateKeyPem = Environment.GetEnvironmentVariable("Private_Key");
        
        var rsa = RSA.Create();
        rsa.ImportFromPem(privateKeyPem);
        return rsa;
    }

    public static RSA GetRsaPublicKey()
    {
        string publicKeyPem = Environment.GetEnvironmentVariable("Public_Key");
        
        var rsa = RSA.Create();
        rsa.ImportFromPem(publicKeyPem);
        return rsa;
    }
}