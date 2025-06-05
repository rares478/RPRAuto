using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using RPRAuto.Server.Interfaces;
using RPRAuto.Server.Models.Bid;
using RPRAuto.Server.Models.Enums;

namespace RPRAuto.Server.Services;

public class BidCompletionService : BackgroundService
{
    private readonly IBidRepository _bidRepository;
    private readonly ILogger<BidCompletionService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    public BidCompletionService(
        IBidRepository bidRepository,
        ILogger<BidCompletionService> logger)
    {
        _bidRepository = bidRepository;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndCompleteExpiredBids();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking expired bids");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task CheckAndCompleteExpiredBids()
    {
        var now = DateTime.UtcNow;
        var filter = Builders<Bid>.Filter.And(
            Builders<Bid>.Filter.Eq(b => b.Status, BidStatus.Active),
            Builders<Bid>.Filter.Lte(b => b.EndAt, now)
        );

        var expiredBids = await _bidRepository.SearchAsync(filter);
        foreach (var bid in expiredBids)
        {
            try
            {
                bid.Status = BidStatus.Completed;
                await _bidRepository.UpdateAsync(bid.Id, bid);
                _logger.LogInformation("Bid {BidId} marked as completed", bid.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating bid {BidId} status", bid.Id);
            }
        }
    }
} 