function getRainfallCategory(rainfall) {
    if (rainfall > 0 && rainfall < 100) {
      return "low rainfall";
    } else if (rainfall >= 100 && rainfall < 300) {
      return "medium rainfall";
    } else if (rainfall >= 300 && rainfall < 500) {
      return "high rainfall";
    } else if (rainfall >= 500) {
      return "very high rainfall";
    } else {
      return "unknown";
    }
  }
  
  function getElevationCategory(elevation) {
    if (elevation < 200) {
      return "low land";
    } else if (elevation >= 200 && elevation < 500) {
      return "hill";
    } else if (elevation >= 500) {
      return "high land";
    } else {
      return "unknown";
    }
  }

module.exports = { getRainfallCategory, getElevationCategory };