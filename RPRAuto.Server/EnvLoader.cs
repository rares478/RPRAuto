using System.Security.Cryptography;

namespace RPRAuto.Server;

public static class EnvLoader
{
    public static RSA GetRsaPrivateKey()
    {
        string privateKeyPem;
        
        // Check for Render secret file path
        string? privateKeyPath = Environment.GetEnvironmentVariable("PRIVATE_KEY");
        if (!string.IsNullOrEmpty(privateKeyPath) && File.Exists(privateKeyPath))
        {
            privateKeyPem = File.ReadAllText(privateKeyPath);
        }
        else
        {
            // Fallback to local development path
            privateKeyPem = File.ReadAllText("RPRAuto.Server/private.pem");
        }
        
        var rsa = RSA.Create();
        rsa.ImportFromPem(privateKeyPem);
        return rsa;
    }

    public static RSA GetRsaPublicKey()
    {
        string publicKeyPem;
        
        // Check for Render secret file path
        string? publicKeyPath = Environment.GetEnvironmentVariable("PUBLIC_KEY");
        if (!string.IsNullOrEmpty(publicKeyPath) && File.Exists(publicKeyPath))
        {
            publicKeyPem = File.ReadAllText(publicKeyPath);
        }
        else
        {
            // Fallback to local development path
            publicKeyPem = File.ReadAllText("RPRAuto.Server/public.pem");
        }
        
        var rsa = RSA.Create();
        rsa.ImportFromPem(publicKeyPem);
        return rsa;
    }
}