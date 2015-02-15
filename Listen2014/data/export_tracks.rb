require 'csv'
require 'json'
require 'date'

class Export
  def self.pttn(key, type)
    Regexp.new "<key>#{key}</key><#{type}>(.*)</#{type}>"
  end

  PTTN_NAME = pttn('Name', 'string')
  ATTRS = {
    artist: pttn('Artist', 'string'),
    album: pttn('Album', 'string'),
    number: pttn('Track Number', 'integer'),
    year: pttn('Year', 'integer'),
    added: pttn('Date Added', 'date'),
    play_count: pttn('Play Count', 'integer'),
    rating: pttn('Rating', 'integer'),
  }

  def initialize()
    @tracks = []
    @current_track = nil
  end

  def parse(file)
    tracks = []
    current_track = nil
    file = File.open("data/#{file}", "r")

    file.each_line do |line|
      if PTTN_NAME.match(line)
        tracks.push(current_track) if current_track
        current_track = { title: $1 }
      else
        ATTRS.each do |name, pattern|
          current_track[name] = $1 if pattern.match(line)
        end
      end
    end
    tracks
  end
end

tracks = Export.new.parse('2014.xml')
File.open('app/tracks2014.json', 'w') {|f| f.write(tracks.to_json) }
