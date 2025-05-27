using System.Text.Json.Serialization;

namespace RPRAuto.Server.Models.Bid;

public class BidCreateRequestWrapper
{
    [JsonPropertyName("request")]
    public BidCreateRequest Request { get; set; } = new BidCreateRequest();
} 