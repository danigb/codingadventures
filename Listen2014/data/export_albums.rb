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
    @albums = {}
    @tracks = 0
    @current_track = nil
  end

  def parse(file)
    file = File.open("data/#{file}", "r")

    file.each_line do |line|
      if PTTN_NAME.match(line)
        add_track($1)
      else
        ATTRS.each do |name, pattern|
          add_track_data(name, $1) if pattern.match(line)
        end
      end
    end
    process_albums
  end

  private
  def album(title)
    @albums[title] ||= { title: title, tracks: [] }
    @albums[title]
  end

  def add_track(title)
    process_current_track
    @current_track = {title: title}
    @tracks += 1
  end

  def add_track_data(key, value)
    @current_track[key] = value
  end

  def process_current_track
    return if @current_track.nil?
    @current_track[:play_count] = 0 if @current_track[:play_count].nil?
    process_date(@current_track)
    album(@current_track[:album])[:tracks].push(@current_track)
  end

  def process_date(track)
    added = track[:added]
    track[:added] = added.split('T')[0]
  end

  def process_albums
    id = 1
    @albums.each_key do |title|
      album = @albums[title]
      album[:id] = id
      artists = album[:tracks].map {|track| track[:artist] }
      album[:artist] = artists.uniq.size == 1 ? artists.first : 'VVAA'
      dates = album[:tracks].map {|track| track[:added]}
      album[:added] = dates.sort!.first
      album_rates = album[:tracks].map {|track| track[:album_rating] }.uniq
      album[:tracks].each do |track|
        [:album, :added, :album_rating].each { |key| track.delete key }
        track.delete :artist unless album[:artist] == 'VVAA'
      end
      album[:tracks_count] = album[:tracks].length
      id += 1
    end
    return @albums.values
  end
end

albums = Export.new.parse('2014.xml')
File.open('albums2014.json', 'w') {|f| f.write(albums.to_json) }
