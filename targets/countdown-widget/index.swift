import WidgetKit
import SwiftUI

// MARK: - Data Models

struct WidgetCountdown: Codable, Identifiable {
    let id: String
    let title: String
    let icon: String
    let targetDate: String
    let bgColor1: String
    let bgColor2: String
    let accentColor: String
    let isComplete: Bool
    let isStarred: Bool?
    let daysRemaining: Int
    let hoursRemaining: Int
    let minutesRemaining: Int
}

struct WidgetDataPayload: Codable {
    let countdowns: [WidgetCountdown]
    let updatedAt: String
}

// MARK: - Data Provider

struct CountdownDataProvider {
    static let appGroupId = "group.app.nabbihni.countdown"

    static func loadCountdowns() -> [WidgetCountdown] {
        guard let defaults = UserDefaults(suiteName: appGroupId),
              let jsonString = defaults.string(forKey: "widgetData"),
              let data = jsonString.data(using: .utf8) else {
            return []
        }

        do {
            let payload = try JSONDecoder().decode(WidgetDataPayload.self, from: data)
            // Recalculate remaining time (data might be stale)
            return payload.countdowns.map { countdown in
                let remaining = calculateRemaining(targetDate: countdown.targetDate)
                return WidgetCountdown(
                    id: countdown.id,
                    title: countdown.title,
                    icon: countdown.icon,
                    targetDate: countdown.targetDate,
                    bgColor1: countdown.bgColor1,
                    bgColor2: countdown.bgColor2,
                    accentColor: countdown.accentColor,
                    isComplete: remaining.isComplete,
                    isStarred: countdown.isStarred,
                    daysRemaining: remaining.days,
                    hoursRemaining: remaining.hours,
                    minutesRemaining: remaining.minutes
                )
            }
        } catch {
            return []
        }
    }

    static func calculateRemaining(targetDate: String) -> (days: Int, hours: Int, minutes: Int, isComplete: Bool) {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let target = formatter.date(from: targetDate) ?? ISO8601DateFormatter().date(from: targetDate) else {
            return (0, 0, 0, true)
        }

        let diff = target.timeIntervalSinceNow
        if diff <= 0 {
            return (0, 0, 0, true)
        }

        let totalSeconds = Int(diff)
        let days = totalSeconds / 86400
        let hours = (totalSeconds % 86400) / 3600
        let minutes = (totalSeconds % 3600) / 60

        return (days, hours, minutes, false)
    }
}

// MARK: - Timeline Provider

struct CountdownTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> CountdownTimelineEntry {
        CountdownTimelineEntry(
            date: Date(),
            countdowns: [
                WidgetCountdown(
                    id: "placeholder",
                    title: "رمضان",
                    icon: "🌙",
                    targetDate: "",
                    bgColor1: "#0f0c29",
                    bgColor2: "#302b63",
                    accentColor: "#a78bfa",
                    isComplete: false,
                    isStarred: nil,
                    daysRemaining: 42,
                    hoursRemaining: 8,
                    minutesRemaining: 30
                )
            ]
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (CountdownTimelineEntry) -> Void) {
        let countdowns = CountdownDataProvider.loadCountdowns()
        let entry = CountdownTimelineEntry(date: Date(), countdowns: countdowns)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CountdownTimelineEntry>) -> Void) {
        let countdowns = CountdownDataProvider.loadCountdowns()
        let entry = CountdownTimelineEntry(date: Date(), countdowns: countdowns)

        // Refresh every 15 minutes for accurate countdown
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct CountdownTimelineEntry: TimelineEntry {
    let date: Date
    let countdowns: [WidgetCountdown]
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 15, 20, 25)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Small Widget View

struct SmallCountdownView: View {
    let entry: CountdownTimelineEntry

    var body: some View {
        if let countdown = entry.countdowns.first {
            ZStack {
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(hex: countdown.bgColor1),
                        Color(hex: countdown.bgColor2)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                VStack(spacing: 4) {
                    Text(countdown.icon)
                        .font(.system(size: 28))

                    if countdown.isComplete {
                        Text("🎉")
                            .font(.system(size: 32, weight: .heavy))
                        Text("حان الوقت!")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(Color(hex: countdown.accentColor))
                    } else {
                        Text(timeValue(countdown))
                            .font(.system(size: 36, weight: .heavy, design: .rounded))
                            .foregroundColor(.white)

                        Text(timeUnit(countdown))
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(Color(hex: countdown.accentColor))
                    }

                    Text(countdown.title)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                        .lineLimit(1)
                }
                .padding(12)
            }
        } else {
            emptyView
        }
    }

    private func timeValue(_ c: WidgetCountdown) -> String {
        if c.daysRemaining > 0 { return "\(c.daysRemaining)" }
        if c.hoursRemaining > 0 { return "\(c.hoursRemaining)" }
        return "\(c.minutesRemaining)"
    }

    private func timeUnit(_ c: WidgetCountdown) -> String {
        if c.daysRemaining > 0 { return "يوم" }
        if c.hoursRemaining > 0 { return "ساعة" }
        return "دقيقة"
    }

    private var emptyView: some View {
        ZStack {
            Color(hex: "#0F1419")
            VStack(spacing: 8) {
                Text("⏳")
                    .font(.system(size: 32))
                Text("كم باقي")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                Text("أضف عد تنازلي")
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.48))
            }
        }
    }
}

// MARK: - Medium Widget View

struct MediumCountdownView: View {
    let entry: CountdownTimelineEntry

    var body: some View {
        if entry.countdowns.isEmpty {
            emptyView
        } else {
            ZStack {
                Color(hex: "#0F1419")

                VStack(spacing: 6) {
                    // Header
                    HStack {
                        Text("⏳ كم باقي")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color(hex: "#F59E0B"))
                        Spacer()
                        Text("\(entry.countdowns.count) عدادات")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.48))
                    }
                    .padding(.horizontal, 4)
                    .padding(.bottom, 2)

                    // Countdown rows
                    ForEach(entry.countdowns) { countdown in
                        countdownRow(countdown)
                    }
                }
                .padding(14)
            }
        }
    }

    private func countdownRow(_ countdown: WidgetCountdown) -> some View {
        HStack(spacing: 10) {
            // Emoji badge
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(.white.opacity(0.08))
                    .frame(width: 36, height: 36)
                Text(countdown.icon)
                    .font(.system(size: 18))
            }

            // Title with star indicator
            Text(countdown.isStarred == true ? "\(countdown.title) ⭐" : countdown.title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(1)

            Spacer()

            // Time badge
            Text(timeString(countdown))
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(countdown.isComplete ? Color(hex: "#34D399") : Color(hex: "#F59E0B"))
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(countdown.isComplete
                              ? Color(hex: "#34D399").opacity(0.15)
                              : Color(hex: "#F59E0B").opacity(0.15))
                )
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(.white.opacity(0.06))
        )
    }

    private func timeString(_ c: WidgetCountdown) -> String {
        if c.isComplete { return "حان الوقت! 🎉" }
        if c.daysRemaining > 0 { return "\(c.daysRemaining) يوم" }
        if c.hoursRemaining > 0 { return "\(c.hoursRemaining) ساعة" }
        return "\(c.minutesRemaining) دقيقة"
    }

    private var emptyView: some View {
        ZStack {
            Color(hex: "#0F1419")
            VStack(spacing: 6) {
                Text("⏳ كم باقي")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                Text("أضف عدادات لتظهر هنا")
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.48))
            }
        }
    }
}

// MARK: - Large Widget View

struct LargeCountdownView: View {
    let entry: CountdownTimelineEntry

    var body: some View {
        if entry.countdowns.isEmpty {
            emptyView
        } else {
            ZStack {
                Color(hex: "#0F1419")

                VStack(spacing: 6) {
                    // Header
                    HStack {
                        Text("⏳ كم باقي")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(Color(hex: "#F59E0B"))
                        Spacer()
                        Text("\(entry.countdowns.count) عدادات")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.48))
                    }
                    .padding(.horizontal, 4)
                    .padding(.bottom, 4)

                    // Countdown rows (up to 5)
                    ForEach(entry.countdowns.prefix(5)) { countdown in
                        countdownRow(countdown)
                    }

                    Spacer(minLength: 0)
                }
                .padding(14)
            }
        }
    }

    private func countdownRow(_ countdown: WidgetCountdown) -> some View {
        HStack(spacing: 10) {
            // Emoji badge
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(.white.opacity(0.08))
                    .frame(width: 36, height: 36)
                Text(countdown.icon)
                    .font(.system(size: 18))
            }

            // Title with star indicator
            Text(countdown.isStarred == true ? "\(countdown.title) ⭐" : countdown.title)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(1)

            Spacer()

            // Time badge
            Text(timeString(countdown))
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(countdown.isComplete ? Color(hex: "#34D399") : Color(hex: "#F59E0B"))
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(countdown.isComplete
                              ? Color(hex: "#34D399").opacity(0.15)
                              : Color(hex: "#F59E0B").opacity(0.15))
                )
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(.white.opacity(0.06))
        )
    }

    private func timeString(_ c: WidgetCountdown) -> String {
        if c.isComplete { return "حان الوقت! 🎉" }
        if c.daysRemaining > 0 { return "\(c.daysRemaining) يوم" }
        if c.hoursRemaining > 0 { return "\(c.hoursRemaining) ساعة" }
        return "\(c.minutesRemaining) دقيقة"
    }

    private var emptyView: some View {
        ZStack {
            Color(hex: "#0F1419")
            VStack(spacing: 6) {
                Text("⏳ كم باقي")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                Text("أضف عدادات لتظهر هنا")
                    .font(.system(size: 13))
                    .foregroundColor(.white.opacity(0.48))
            }
        }
    }
}

// MARK: - Widget Configuration

struct NabbihniSmallWidget: Widget {
    let kind: String = "NabbihniSmallWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CountdownTimelineProvider()) { entry in
            SmallCountdownView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .containerBackground(for: .widget) {
                    Color(hex: "#0F1419")
                }
        }
        .configurationDisplayName("عد تنازلي")
        .description("تابع أقرب عد تنازلي")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct NabbihniMediumWidget: Widget {
    let kind: String = "NabbihniMediumWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CountdownTimelineProvider()) { entry in
            MediumCountdownView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .containerBackground(for: .widget) {
                    Color(hex: "#0F1419")
                }
        }
        .configurationDisplayName("عداداتي")
        .description("تابع أهم العدادات")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct NabbihniLargeWidget: Widget {
    let kind: String = "NabbihniLargeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CountdownTimelineProvider()) { entry in
            LargeCountdownView(entry: entry)
                .environment(\.layoutDirection, .rightToLeft)
                .containerBackground(for: .widget) {
                    Color(hex: "#0F1419")
                }
        }
        .configurationDisplayName("كل عداداتي")
        .description("تابع جميع العدادات")
        .supportedFamilies([.systemLarge])
        .contentMarginsDisabled()
    }
}

@main
struct NabbihniWidgetBundle: WidgetBundle {
    var body: some Widget {
        NabbihniSmallWidget()
        NabbihniMediumWidget()
        NabbihniLargeWidget()
    }
}
