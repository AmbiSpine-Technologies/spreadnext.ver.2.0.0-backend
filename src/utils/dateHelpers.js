// utils/dateHelpers.js
export const getDateRange = (filter) => {
  const now = new Date();
  switch (filter) {
    case '1h': return new Date(now.setHours(now.getHours() - 1));
    case '1d': return new Date(now.setDate(now.getDate() - 1));
    case '7d':
    case '1week': return new Date(now.setDate(now.getDate() - 7));
    case '15d': return new Date(now.setDate(now.getDate() - 15));
    case '30d': return new Date(now.setDate(now.getDate() - 30));
    case '3m': return new Date(now.setMonth(now.getMonth() - 3));
    case '12m': return new Date(now.setFullYear(now.getFullYear() - 1));
    default: return new Date(now.setDate(now.getDate() - 7));
  }
};

// Common Time Series Aggregator to avoid code duplication
export const getTimeSeries = async (Model, dateField, startDate) => {
  const data = await Model.aggregate([
    { $match: { [dateField]: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const total = await Model.countDocuments({ [dateField]: { $gte: startDate } });
  return { total, timeSeries: data };
};